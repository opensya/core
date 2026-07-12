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
} from "@opensya/persistence";
import { drizzle } from "drizzle-orm/node-postgres";
import _ from "lodash";
import { loadMetadatas } from "./load-metadatas.js";
import path from "node:path";
import { getDirs } from "../../utils/dirs.js";
import { atomicWriteFile } from "../../utils/atomic_write_ile.js";

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
  await loadMetadatas();
  const metadatas = await import("#server/database/tables/index.js");
  generateType();

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
  hooks.onBeforeCreate("users", (data) => ({
    ...data,
    email:
      typeof data.email === "string"
        ? data.email.trim().toLowerCase()
        : data.email,
  }));

  const audit = createAuditManager(
    createDatabaseAuditWriter(auditLogsMetadata.name),
  );
  const outbox = createDatabaseOutboxWriter(outboxEventsMetadata.name);
  const engine = createQueryEngine(
    registry,
    adapter,
    hooks,
    undefined,
    audit,
    outbox,
  );
  const schemaCreation = await engine.schema.createTables();

  return {
    adapter,
    engine,
    schemaCreation,
    close: () => database.$client.end(),
  };
}
