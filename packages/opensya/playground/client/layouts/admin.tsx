import { AppSidebar } from "@/components/sidebar-app";
import type { Block } from "@/components/sidebar-app/nav-main";
import { TeamSwitcher } from "@/components/sidebar-app/team-switcher";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";

export default function AdminLayout({
  children,
  blocks = [],
}: {
  children: React.ReactNode;
  blocks?: Block[] | (() => Block[]);
}) {
  blocks = typeof blocks === "function" ? blocks() : blocks;

  const teams = [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar
        blocks={blocks}
        header={<TeamSwitcher teams={teams} />}
      ></AppSidebar>

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
