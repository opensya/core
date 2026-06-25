import { definePageMeta } from "@core/client/page-meta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";

definePageMeta({
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
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string>();

  async function handleSubmit() {
    try {
      setError(undefined);
      setIsLoading(true);

      await logout();

      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-4xl my-5 mx-auto w-full px-4 sm:px-6 lg:px-8">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia ratione
        expedita suscipit quidem vel veritatis id facere ducimus mollitia nihil
        autem molestias, illum, impedit eaque quam. Quaerat ipsum similique
        maxime.
      </p>

      <Button onClick={handleSubmit} disabled={isLoading}>
        logoutdfdf
      </Button>
    </div>
  );
}
