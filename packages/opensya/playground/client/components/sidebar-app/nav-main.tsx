"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export interface Block {
  title?: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}

export function NavMain({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) => (
    <SidebarGroup key={i}>
      {block.title && <SidebarGroupLabel>{block.title}</SidebarGroupLabel>}

      <SidebarMenu>
        {block.items.map((item, itemIndex) => (
          <Collapsible
            key={item.title + itemIndex}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link to={item.url}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon className="opacity-50" />}

                    <span>{item.title}</span>

                    {item.items?.length && (
                      <ChevronRight className="transition-transform duration-200 size-3! opacity-50 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>

              {item.items?.length && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  ));
}
