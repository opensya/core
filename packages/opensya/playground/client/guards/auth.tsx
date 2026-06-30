import { useAuth } from "@/components/providers/auth";
import { useHasAnyPermission } from "@/lib/auth/use-permissions";
import { usePageMeta } from "@core/client/page-meta";
import { Navigate } from "react-router-dom";

export default function ({ children }: { children: React.ReactNode }) {
  const meta = usePageMeta();
  const hasAccess = useHasAnyPermission(meta?.roles);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  const requiresAuth = meta?.auth === true;
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const requiresRoles = Boolean(meta?.roles && meta.roles.length > 0);
  if (requiresRoles && !hasAccess) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
