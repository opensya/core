import { TooltipProvider } from "@/components/ui/tooltip";

export default function AuthGlobalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
