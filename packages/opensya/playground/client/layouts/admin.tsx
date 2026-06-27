import { AppSidebar } from "@/components/sidebar-app";
import type { Block } from "@/components/sidebar-app/nav-main";
import { AuthMenu } from "@/components/sidebar-app/auth-menu";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({
  children,
  blocks = [],
}: {
  children: React.ReactNode;
  blocks?: Block[] | (() => Block[]);
}) {
  const { pathname } = useLocation();
  const isAdminHome = pathname === "/admin";

  blocks = typeof blocks === "function" ? blocks() : blocks;

  return (
    <SidebarProvider>
      <AppSidebar
        blocks={blocks}
        header={
          isAdminHome ? (
            <AuthMenu />
          ) : (
            <div>
              <Button variant="ghost" size="sm" className="rounded-4xl" asChild>
                <Link to="/admin" replace>
                  <ArrowLeft /> Back to home
                </Link>
              </Button>
            </div>
          )
        }
      ></AppSidebar>

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
