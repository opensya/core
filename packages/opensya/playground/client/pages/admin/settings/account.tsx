import { definePageMeta } from "@core/client/page-meta";
import { UserProvider } from "@/components/providers/user";
import { useAuth } from "@/components/providers/auth";
import { Outlet } from "react-router-dom";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  const { user } = useAuth();

  return (
    <UserProvider id={user!.id}>
      <Outlet />
    </UserProvider>
  );
}
