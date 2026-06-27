import { Outlet } from "react-router-dom";
import { definePageMeta } from "@core/client/page-meta";

export const meta = definePageMeta({
  auth: true,
  layout: "admin",
});

export default function Page() {
  return <Outlet />;
}
