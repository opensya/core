import { Outlet } from "react-router-dom";
import { definePageMeta } from "@core/client/page-meta";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";

export const meta = definePageMeta({
  auth: true,
  layout: {
    name: "admin",
    blocks: getBlocks,
  },
});

function getBlocks() {
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

export default function Page() {
  return <Outlet />;
}
