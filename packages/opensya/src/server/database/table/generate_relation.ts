import { atomicWriteFile, readJson } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { join } from "node:path";
import { getDirs } from "../../../utils";

const relationTemplate = `import { defineRelations } from 'drizzle-orm';

{{imports_tables}}

export const {{export_name}} = defineRelations({ {{tables}} }, (r) => ({
{{body}}
}));
`;

/**
 * Résultat de la génération : un fichier par table impliquée.
 * L'appelant est responsable de l'écriture (ou on écrit directement ici).
 */
interface RelationFile {
  tableName: string; // nom logique (clé manifest)
  fileName: string; // nom du fichier de sortie sans extension
  content: string;
}

export function generateAllRelations(
  manifest: Record<string, TableMeta>,
): RelationFile[] {
  const relationsMap = new Map<string, string[]>();
  const importsMap = new Map<string, Set<string>>();

  const ensureTable = (t: string) => {
    if (!relationsMap.has(t)) relationsMap.set(t, []);
    if (!importsMap.has(t)) importsMap.set(t, new Set([t]));
  };

  for (const name in manifest) {
    if (!Object.hasOwn(manifest, name)) continue;

    const meta = manifest[name];
    const tableFrom = meta.name;

    ensureTable(tableFrom);

    for (const key in meta.columns) {
      if (!Object.hasOwn(meta.columns, key)) continue;
      if (key === "default") continue;

      const column = meta.columns[key];
      if (!column.relation) continue;

      const relation = column.relation;
      const fieldFrom = key;
      const [tableTo, fieldTo] = relation.to.split(".");

      if (!tableTo || !fieldTo) {
        throw new Error(
          `Invalid relation target "${relation.to}" on column "${tableFrom}.${fieldFrom}". ` +
            `Expected format: "table.field"`,
        );
      }

      if (!manifest[tableTo]) {
        throw new Error(
          `Related table "${tableTo}" not found in manifest (referenced by "${tableFrom}.${fieldFrom}")`,
        );
      }

      const alias = relation.alias ?? tableTo;

      const existingAliases = relationsMap.get(tableFrom) ?? [];
      const aliasAlreadyUsed = existingAliases.some((line) =>
        line.trimStart().startsWith(`${alias}:`),
      );
      if (aliasAlreadyUsed) {
        throw new Error(
          `Alias collision on table "${tableFrom}": alias "${alias}" is already used. ` +
            `Provide an explicit "alias" on relation "${tableFrom}.${fieldFrom}".`,
        );
      }

      ensureTable(tableFrom);
      importsMap.get(tableFrom)!.add(tableTo);
      relationsMap
        .get(tableFrom)!
        .push(
          `  ${alias}: r.one.${tableTo}({\n` +
            `    from: r.${tableFrom}.${fieldFrom},\n` +
            `    to: r.${tableTo}.${fieldTo},\n` +
            `  })`,
        );

      if (relation.inverse?.alias) {
        const inverseAlias = relation.inverse.alias;

        ensureTable(tableTo);
        importsMap.get(tableTo)!.add(tableFrom);

        const existingInverseAliases = relationsMap.get(tableTo) ?? [];
        const inverseAliasAlreadyUsed = existingInverseAliases.some((line) =>
          line.trimStart().startsWith(`${inverseAlias}:`),
        );
        if (inverseAliasAlreadyUsed) {
          throw new Error(
            `Alias collision on table "${tableTo}": alias "${inverseAlias}" is already used. ` +
              `Provide a distinct "inverse.alias" on relation "${tableFrom}.${fieldFrom}".`,
          );
        }

        relationsMap
          .get(tableTo)!
          .push(`  ${inverseAlias}: r.many.${tableFrom}()`);
      }
    }
  }

  const { OUTPUT_DIR_SERVER } = getDirs();
  const outputTablesDir = join(OUTPUT_DIR_SERVER, "database/tables");
  const generatedFiles: RelationFile[] = [];

  for (const [tableName, lines] of relationsMap) {
    if (lines.length === 0) continue;

    const tableMeta = manifest[tableName];
    if (!tableMeta) {
      throw new Error(`Table "${tableName}" not found in manifest`);
    }

    const tableImports = importsMap.get(tableName) ?? new Set([tableName]);

    const importsTables = [...tableImports]
      .map((t) => {
        const m = manifest[t];
        if (!m) throw new Error(`Table "${t}" not found in manifest`);
        return `import ${t} from './${m.tableName}'`;
      })
      .join(";\n");

    const tables = [...tableImports].join(", ");
    const body = lines.join(",\n");
    const exportName = `${toCamelCase(tableMeta.tableName)}Relations`;

    const content = relationTemplate
      .replace("{{imports_tables}}", importsTables)
      .replace("{{export_name}}", exportName)
      .replace("{{tables}}", tables)
      .replace("{{body}}", body);

    const fileName = `${tableMeta.tableName}.relations`;
    atomicWriteFile(join(outputTablesDir, `${fileName}.js`), content);
    generatedFiles.push({ tableName, fileName, content });
  }

  const indexImports = generatedFiles
    .map(({ tableName, fileName }) => {
      const tableMeta = manifest[tableName];
      const exportName = `${toCamelCase(tableMeta!.tableName)}Relations`;
      return `export { ${exportName} } from './tables/${fileName}'`;
    })
    .join(";\n");

  const indexContent = `// Auto-generated — do not edit manually\n\n${indexImports};\n`;

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "database/relations.js"),
    `${indexContent}\n`,
  );

  return generatedFiles;
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function generateRelations() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const metas = readJson<Record<string, TableMeta>>(
    join(OUTPUT_DIR_SERVER, "database/tables.json"),
    {},
  );

  generateAllRelations(metas);
}
