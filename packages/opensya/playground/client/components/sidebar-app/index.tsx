"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain, type Block } from "./nav-main";
import { Button } from "../ui/button";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  blocks?: Block[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { state, toggleSidebar } = useSidebar();
  return (
    <Sidebar className="border-r" collapsible="icon" {...props}>
      {props.header && (
        <SidebarHeader className="z-21">{props.header}</SidebarHeader>
      )}

      <SidebarContent>
        {state === "collapsed" && (
          <div
            className="absolute inset-0 z-0 w-full  cursor-e-resize"
            onClick={toggleSidebar}
          />
        )}

        <NavMain blocks={props.blocks ?? []} />
      </SidebarContent>

      <SidebarFooter>
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-default"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 21v-.5m0-3c0-5.1 5-3.825 5-8.924c0-6.768-10-6.768-10 0"
              />
            </svg>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
