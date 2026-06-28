import { definePageMeta } from "@core/client/page-meta";
import { Outlet } from "react-router-dom";

import {
  Bell,
  Blocks,
  CreditCard,
  Download,
  KeyRound,
  Plug,
  Shield,
  User,
  Users,
  UserPlus,
  Settings,
  Building2,
  Sparkles,
  Plus,
} from "lucide-react";
import type { Block } from "@/components/sidebar-app/nav-main";

export function getBlocks(): Block[] {
  return [
    {
      title: "Personal",
      items: [
        {
          title: "Preferences",
          // url: "/admin/settings/preferences",
          icon: Settings,
        },
        {
          title: "Profile",
          url: "/admin/settings/account/profile",
          icon: User,
        },
        {
          title: "Notifications",
          // url: "/admin/settings/notifications",
          icon: Bell,
        },
        {
          title: "Security & access",
          // url: "/admin/settings/security",
          icon: Shield,
        },
        {
          title: "Connected accounts",
          // url: "/admin/settings/accounts",
          icon: Plug,
        },
        {
          title: "Agent personalization",
          // url: "/admin/settings/agent",
          icon: Sparkles,
        },
      ],
    },

    {
      title: "Administration",
      items: [
        {
          title: "Organisation",
          url: "/admin/settings/organisation",
          icon: Building2,
        },
        {
          title: "Teams",
          // url: "/admin/settings/teams",
          icon: Users,
        },
        {
          title: "Members",
          // url: "/admin/settings/members",
          icon: UserPlus,
        },
        {
          title: "Security",
          // url: "/admin/settings/security/workspace",
          icon: KeyRound,
        },
        {
          title: "API",
          // url: "/admin/settings/api",
          icon: Blocks,
        },
        {
          title: "Applications",
          // url: "/admin/settings/applications",
          icon: Plug,
        },
        {
          title: "Billing",
          // url: "/admin/settings/billing",
          icon: CreditCard,
        },
        {
          title: "Import & export",
          // url: "/admin/settings/import-export",
          icon: Download,
        },
      ],
    },

    {
      title: "Your teams",
      items: [
        {
          title: "Create a team",
          // url: "/admin/settings/teams/new",
          icon: Plus,
        },
      ],
    },
  ];
}

export const meta = definePageMeta({
  auth: true,
  layout: {
    name: "admin",
    blocks: getBlocks,
  },
});

export default function Page() {
  return <Outlet />;
}
