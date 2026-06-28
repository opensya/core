import { CircleX } from "lucide-react";
import { $fetch } from "ofetch";

export const $api = $fetch.create({
  credentials: "include",

  headers: {
    Accept: "application/json",
  },

  async onResponseError(error) {
    if (error.response._data) {
      const { toast } = await import("sonner");

      toast.error(error.response._data.message, {
        icon: <CircleX className="text-red-500 mr-5" size={16} />,
      });
    }
  },
});

export function useApi() {
  return $api;
}

export async function uploadFile(
  file: File,
  { ownerId, ownerType }: { ownerId: string; ownerType: string },
) {
  const { fileId, presignedUrl } = await $api<{
    fileId: string;
    presignedUrl: string;
  }>("/api/files/init", {
    method: "post",
    body: {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      ownerId,
      ownerType,
    },
    credentials: "omit",
  });

  // 2. Upload direct vers le storage
  await $api(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type, Accept: "*/*" },
    credentials: "omit",
  });

  // 3. Confirm
  await $api(`/api/files/${fileId}/confirm`, {
    method: "post",
    credentials: "omit",
  });

  return { fileId, presignedUrl };
}
