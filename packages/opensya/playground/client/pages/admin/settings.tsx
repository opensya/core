import { definePageMeta } from "@core/client/page-meta";
import { Outlet } from "react-router-dom";

export const meta = definePageMeta({
  auth: true,
  layout: {
    name: "admin",
    blocks: getBlocks,
  },
});

function getBlocks() {
  return [];
}

export default function Page() {
  return <Outlet />;
}
