import { AppSidebar } from "@/components/sidebar-app";
import type { Block } from "@/components/sidebar-app/nav-main";
import { AuthMenu } from "@/components/sidebar-app/auth-menu";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminLayout({
  children,
  blocks,
}: {
  children: React.ReactNode;
  blocks?: Block[] | (() => Block[]);
}) {
  function getDefaultBlock() {
    return [
      {
        title: "Platforms",
        items: [
          {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
          },
          {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
              {
                title: "Genesis",
                url: "#",
              },
              {
                title: "Explorer",
                url: "#",
              },
              {
                title: "Quantum",
                url: "#",
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
              {
                title: "Introduction",
                url: "#",
              },
              {
                title: "Get Started",
                url: "#",
              },
              {
                title: "Tutorials",
                url: "#",
              },
              {
                title: "Changelog",
                url: "#",
              },
            ],
          },
          {
            title: "Settings",
            url: "/admin/settings",
            icon: Settings2,
          },
        ],
      },
    ];
  }

  blocks = typeof blocks === "function" ? blocks() : blocks;

  return (
    <SidebarProvider>
      <AppSidebar
        blocks={blocks ?? getDefaultBlock()}
        header={
          !blocks ? (
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
