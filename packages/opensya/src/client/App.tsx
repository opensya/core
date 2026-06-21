import { CheckCircle2Icon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@ui:components/ui/alert";
import { ThemeModeToggle } from "@ui:components/theme-mode-toggle";
import { ThemeProvider } from "@ui:components/theme-provider";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
}

export function AlertDemo() {
  return (
    <div className="grid w-full max-w-md items-start gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Payment successful</AlertTitle>
        <AlertDescription>
          Your payment of $29.99 has been processed. A receipt has been sent to
          your email address.
        </AlertDescription>
      </Alert>
      <Alert>
        <InfoIcon />
        <AlertTitle>New feature available</AlertTitle>
        <AlertDescription>
          We&apos;ve added dark mode support. You can enable it in your account
          settings.
        </AlertDescription>
      </Alert>

      <div>
        <ThemeModeToggle></ThemeModeToggle>
      </div>
    </div>
  );
}

export default App;
