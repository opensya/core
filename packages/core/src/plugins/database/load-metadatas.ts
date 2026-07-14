import path from "path";
import { getListOpensyaConfig } from "../../config/load.js";
import { getDirs, SERVER_DIRNAME } from "../../utils/dirs.js";
import { existsSync } from "fs";
import { getChildren } from "../../utils/get-children.js";
import { loadDefaultJs } from "../../utils/load-js.js";
import type { TableMetadata } from "@opensya/persistence";
import { atomicWriteFile } from "../../utils/atomic-write-file.js";
import _ from "lodash";

export async function loadMetadatas() {
  const configs = _.reverse(getListOpensyaConfig());
  const { OUTPUT_DIR_SERVER } = getDirs();

  let tables: string[] = ["users"];

  for (const { _srcDir } of configs) {
    const tablesDir = path.resolve(_srcDir, SERVER_DIRNAME, "database/tables");
    if (!existsSync(tablesDir)) continue;

    await load(tablesDir);
  }

  async function load(tablesDir: string) {
    const files = getChildren(tablesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(js|ts)$/,
    });

    for (const file of files) {
      const content = await loadDefaultJs<TableMetadata>(file.path);
      if (!content) continue;

      const rPath = path.relative(
        path.resolve(OUTPUT_DIR_SERVER, "database/tables"),
        file.path,
      );

      atomicWriteFile(
        path.resolve(
          OUTPUT_DIR_SERVER,
          "database/tables",
          `${content.name}.js`,
        ),
        [
          `import ${content.name} from '${rPath}'\n`,
          `export default ${content.name}\n`,
        ].join("\n"),
      );

      tables.push(content.name);
    }
  }

  tables = _.uniq(tables);

  const imports: string[] = [];

  for (const table of tables) {
    imports.push(`import ${table} from './${table}.js';`);
  }

  atomicWriteFile(
    path.resolve(OUTPUT_DIR_SERVER, "database/tables/index.js"),
    imports.join("\n") + `\n\nexport default [\n  ${tables.join(",\n")}\n]`,
  );
}
