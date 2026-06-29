import { definePageMeta } from "@core/client/page-meta";
import { UserProvider } from "@/providers/user";
import { useAuth } from "@/providers/02.session.global";
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
