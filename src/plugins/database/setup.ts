import {
  createAuditManager,
  createDatabaseAuditWriter,
  createDatabaseOutboxWriter,
  createPostgreAdapter,
  createHooksRegistry,
  createMetadataRegistry,
  createQueryEngine,
  createAuditLogMetadata,
  createOutboxMetadata,
  loadMigrations,
  lastMigration,
  saveMigration,
} from "@opensya/persistence";
import { drizzle } from "drizzle-orm/node-postgres";
import _ from "lodash";
import { loadMetadatas } from "./load-metadatas.js";
import path, { join } from "node:path";
import { getDirs } from "../../utils/dirs.js";
import { atomicWriteFile } from "../../utils/atomic_write_ile.js";
import { registerHelpers } from "./helpers.js";
import { loadDatabaseHooks } from "./load-hoos.js";

function generateType() {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const rPath = path.relative(
    path.resolve(OUTPUT_DIR_SERVER, "database"),
    import.meta.filename,
  );

  const content = `import type { setup } from "${rPath}";
  
declare global {
  const database: Awaited<ReturnType<typeof setup>>;
}

export {};
`;

  atomicWriteFile(
    path.resolve(OUTPUT_DIR_SERVER, "database/index.d.ts"),
    content,
  );
}

export async function setup() {
  registerHelpers();

  await loadMetadatas();
  generateType();

  const metadatas = await import("#server/database/tables/index.js");

  const adapters = {
    postgresql() {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error(
          "DATABASE_URL is required. Copy playground/.env.example to playground/.env.",
        );
      }

      const database = drizzle({ connection: { connectionString } });
      const adapter = createPostgreAdapter(database);

      return { database, adapter };
    },
  };

  const { adapter, database } = adapters.postgresql();

  const auditLogsMetadata = createAuditLogMetadata({
    collectionName: "audit_logs",
  });

  const outboxEventsMetadata = createOutboxMetadata({
    collectionName: "outbox_events",
  });

  const registry = createMetadataRegistry(
    ...metadatas.default,

    auditLogsMetadata,
    outboxEventsMetadata,
  );

  registry.lock();

  const hooks = createHooksRegistry();
  const hookDefinitions = await loadDatabaseHooks();
  for (const definition of hookDefinitions) {
    await definition({ hooks });
  }

  const audit = createAuditManager(
    createDatabaseAuditWriter(auditLogsMetadata.name),
  );
  const outbox = createDatabaseOutboxWriter(outboxEventsMetadata.name);
  const engine = createQueryEngine({ registry, adapter, hooks, audit, outbox });

  // const schemaCreation = await engine.schema.createTables();

  const { INPUT_DIR_SERVER } = getDirs();
  const directory = join(INPUT_DIR_SERVER, "database/migrations");

  let migrations = await loadMigrations(directory);

  const migration = engine.migrations.generate({
    name: crypto.randomUUID(),
    previous: lastMigration(migrations),
  });

  if (migration.operations.length) {
    await saveMigration(directory, migration);
    migrations = await loadMigrations(directory);
  }

  await engine.migrations.apply(migrations, {
    allowDestructive: true,
    // dryRun: true,
  });

  for (const metadata of registry.getAll()) {
    adapter.buildTable(metadata);
  }

  const _database = {
    adapter,
    engine,
    // schemaCreation,
    close: () => database?.$client?.end(),
  };

  Object.assign(globalThis, { database: _database });

  return _database;
}
