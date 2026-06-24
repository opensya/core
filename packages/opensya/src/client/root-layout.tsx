import { Outlet } from "react-router-dom";
import { layouts } from "virtual:layouts";
import { guards } from "virtual:guards";
import { usePageMeta } from "./page-meta";

function composeGuards(children: React.ReactNode) {
  return guards.reduceRight((acc, Guard) => {
    return <Guard>{acc}</Guard>;
  }, children);
}

export function RootLayout() {
  const meta = usePageMeta();
  const content = composeGuards(<Outlet />);

  const layoutName = meta?.layout ?? "default";
  const Layout = layouts[layoutName] ?? layouts.default;
  if (!Layout) return content;

  return <Layout>{content}</Layout>;
}
