import { useApi } from "@/lib/api";
import type { Nullable } from "@opensya/utils";
import { useEffect, useState } from "react";

interface FileImageProps {
  fileId?: Nullable<string>;
  children: (url: string | null) => React.ReactNode;
}

export function FileImage({ fileId, children }: FileImageProps) {
  const api = useApi();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      (async () => {})().then(() => setUrl(null));
      return;
    }

    api<{ url: string }>(`/api/files/${fileId}/url`)
      .then((res) => setUrl(res.url))
      .catch(() => setUrl(null));
  }, [api, fileId]);

  return <>{children(url)}</>;
}
