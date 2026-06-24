import { definePageMeta } from "@core/client/page-meta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

definePageMeta({
  auth: true,
  layout: "admin",
});

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
    <>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia ratione
        expedita suscipit quidem vel veritatis id facere ducimus mollitia nihil
        autem molestias, illum, impedit eaque quam. Quaerat ipsum similique
        maxime.
      </p>

      <Button onClick={handleSubmit} disabled={isLoading}>
        logout
      </Button>
    </>
  );
}
