import { Outlet } from "react-router-dom";
import { guards } from "virtual:guards";

function composeGuards(children: React.ReactNode) {
  return guards.reduceRight((acc, Guard) => {
    return <Guard>{acc}</Guard>;
  }, children);
}

export function RootLayout() {
  return composeGuards(<Outlet />);
}
