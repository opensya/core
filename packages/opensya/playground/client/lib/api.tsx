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
