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
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url?: string;
    }[];
  }[];
}

export function NavMain({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) => (
    <SidebarGroup key={block.title ?? i}>
      {block.title && <SidebarGroupLabel>{block.title}</SidebarGroupLabel>}

      <SidebarMenu>
        {block.items.map((item, itemIndex) => {
          const hasChildren = Boolean(item.items?.length);
          const content = (
            <SidebarMenuButton tooltip={item.title}>
              {item.icon && <item.icon className="opacity-50" />}

              <span>{item.title}</span>

              {hasChildren && (
                <ChevronRight className="transition-transform duration-200 size-3! opacity-50 group-data-[state=open]/collapsible:rotate-90" />
              )}
            </SidebarMenuButton>
          );

          return (
            <Collapsible
              key={item.title + itemIndex}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  {item.url ? <Link to={item.url}>{content}</Link> : content}
                </CollapsibleTrigger>

                {hasChildren && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {subItem.url ? (
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            ) : (
                              <span>{subItem.title}</span>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  ));
}
