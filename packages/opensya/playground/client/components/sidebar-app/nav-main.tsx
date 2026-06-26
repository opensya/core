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
                <a href={item.url}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon className="opacity-50" />}

                    <span>{item.title}</span>

                    {item.items?.length && (
                      <ChevronRight
                        size={1}
                        className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    )}
                  </SidebarMenuButton>
                </a>
              </CollapsibleTrigger>

              {item.items?.length && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
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
