"use client";

import { Building2, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/providers/02.session.global";
import { Spinner } from "../ui/spinner";
import { Link, useNavigate } from "react-router-dom";

export function AuthMenu() {
  const navigate = useNavigate();
  const { organisation, logout, isLogouting } = useSession();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    organisation && (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="w-fit px-1.5">
                <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-3!" />
                </div>

                <span className="truncate font-medium">
                  {organisation.name}
                </span>
                <ChevronDown className="opacity-50 size-4!" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuItem asChild>
                <Link to="/admin/settings">
                  Settings
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleLogout();
                  }}
                  disabled={isLogouting}
                >
                  <div className="font-medium text-muted-foreground flex items-center gap-2">
                    {isLogouting && <Spinner />}
                    <span>{isLogouting ? "Logging out..." : "Log out"}</span>
                  </div>

                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  );
}
