import { definePageMeta } from "@core/client/page-meta";
import { Navigate } from "react-router-dom";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  return <Navigate to="/admin/settings/organisation" replace />;
}
