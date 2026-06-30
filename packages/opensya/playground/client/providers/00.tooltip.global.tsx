import { TooltipProvider } from "@/components/ui/tooltip";

export default function ({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
