import { AppSidebar } from "@/components/sidebar-app";
import type { Block } from "@/components/sidebar-app/nav-main";
import { AuthMenu } from "@/components/sidebar-app/auth-menu";
import {
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Bot,
  ChevronLeft,
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
            <SidebarMenuButton className="w-fit px-1.5" asChild>
              <Link to="/admin" replace>
                <div className="flex aspect-square size-5 items-center justify-center rounded-md">
                  <ChevronLeft />
                </div>

                <span className="truncate font-medium">Back to home</span>
              </Link>
            </SidebarMenuButton>
          )
        }
      ></AppSidebar>

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
