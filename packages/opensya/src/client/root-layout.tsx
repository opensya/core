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

  let layout = meta?.layout ?? "default";

  if (typeof layout === "string") layout = { name: layout };

  if (layout) {
    const Layout = layouts[layout.name] ?? layouts.default;
    if (Layout) return <Layout {...layout}>{content}</Layout>;
  }

  return content;
}
