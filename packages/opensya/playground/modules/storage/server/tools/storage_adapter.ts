export type UploadIntent = {
  key: string;
  mimeType: string;
  expiresIn?: number; // secondes, default 900
};

export type DownloadIntent = {
  key: string;
  expiresIn?: number; // secondes, default 3600
  visibility?: "public" | "private" | "restricted";
};

export interface StorageAdapter {
  /** Génère une presigned URL pour upload direct client → storage */
  presignUpload(intent: UploadIntent): Promise<string>;

  /** Génère une presigned URL de lecture */
  presignDownload(intent: DownloadIntent): Promise<string>;

  /** Vérifie que le fichier existe dans le storage */
  exists(key: string): Promise<boolean>;

  /** Supprime le fichier du storage */
  delete(key: string): Promise<void>;
}
