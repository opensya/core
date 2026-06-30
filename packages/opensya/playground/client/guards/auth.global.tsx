import { useSession } from "@/components/providers/auth";
import { usePageMeta } from "@core/client/page-meta";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const meta = usePageMeta();
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) return null;

  const requiresAuth = meta?.auth === true;

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

declare module "@core/client/page-meta" {
  interface PageMeta {
    auth?: boolean;
  }
}
