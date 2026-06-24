import { useAuth } from "@/components/AuthProvider";
import { usePageMeta } from "@core/client/page-meta";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const meta = usePageMeta();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (meta?.auth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

declare module "@core/client/page-meta" {
  interface PageMeta {
    auth?: boolean;
  }
}
