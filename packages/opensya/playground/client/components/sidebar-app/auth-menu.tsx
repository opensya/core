"use client";

import { ChevronDown } from "lucide-react";

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
import { FileImage } from "@@/modules/storage/client/components/file-image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
                <FileImage fileId={organisation?.logoId}>
                  {(url) => (
                    <Avatar size="sm" className="cursor-pointer ">
                      <>
                        <AvatarImage src={url ?? undefined} />

                        {organisation && (
                          <AvatarFallback>
                            {organisation.name.at(0)}
                          </AvatarFallback>
                        )}
                      </>
                    </Avatar>
                  )}
                </FileImage>

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
