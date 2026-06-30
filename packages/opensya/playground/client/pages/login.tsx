import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSession } from "@/components/providers/auth";
import { login } from "@/lib/auth/api";

export default function LoginPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { load } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError(undefined);
      setIsLoading(true);

      await login({ email, password });
      await load();

      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Connectez-vous à votre compte pour continuer.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>

                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>

                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Mot de passe oublié ?
                      </a>
                    </div>

                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </Field>

                  {error && (
                    <FieldDescription className="text-destructive">
                      {error}
                    </FieldDescription>
                  )}

                  <Field>
                    <Button disabled={isLoading} type="submit">
                      {isLoading ? "Connexion..." : "Se connecter"}
                    </Button>

                    <Button
                      disabled={isLoading}
                      variant="outline"
                      type="button"
                    >
                      Se connecter avec Google
                    </Button>

                    <FieldDescription className="text-center">
                      Vous n&apos;avez pas de compte ?{" "}
                      <a href="#">Créer un compte</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
