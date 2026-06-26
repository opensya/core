import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        logout
      </Button>

      <Button onClick={() => navigate("/admin/settings")}>settings</Button>
    </div>
  );
}
