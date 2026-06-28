import { join } from "node:path";
import { FileService, LocalAdapter, setFileService } from "../tools/storage";
import { definePlugin } from "@core/server";

type StorageAdapterKey = "local";

export default definePlugin((app) => {
  app.addContentTypeParser("*", { parseAs: "buffer" }, (_, body, done) =>
    done(null, body),
  );

  app.addHook("onListen", () => {
    let adapterKey = process.env.STORAGE_ADAPTER as StorageAdapterKey;
    adapterKey ??= "local";

    const storageAdapters: Record<StorageAdapterKey, () => LocalAdapter> = {
      local: () =>
        new LocalAdapter(
          process.env.STORAGE_LOCAL_BASE_DIR ?? join(process.cwd(), ".storage"),
          "http://[::1]:4751",
        ),
    };

    if (!(adapterKey in storageAdapters)) {
      app.close().finally(() => {
        throw new Error(
          `Unknown storage adapter "${adapterKey}". Available: ${Object.keys(storageAdapters).join(", ")}`,
        );
      });
      return;
    }

    setFileService(
      new FileService(
        storageAdapters[adapterKey](),
        process.env.STORAGE_BUCKET ?? "local",
      ),
    );
  });
});
