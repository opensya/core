import { useMatches } from "react-router-dom";

export interface PageMeta {
  name?: string;
  layout?: string | false | { name: string; [key: string]: unknown };
}

export function definePageMeta(meta: PageMeta): PageMeta {
  return meta;
}

interface RouteHandle {
  meta?: PageMeta;
}

function resolveLayout(
  matches: Array<{ handle?: RouteHandle }>,
): PageMeta["layout"] {
  for (let i = matches.length - 1; i >= 0; i--) {
    const layout = matches[i].handle?.meta?.layout;

    if (layout !== undefined) return layout;
  }

  return undefined;
}

export function usePageMeta(): PageMeta {
  const matches = useMatches() as Array<{ handle?: RouteHandle }>;

  const metas = matches
    .map((match) => match.handle?.meta)
    .filter(Boolean) as PageMeta[];

  const currentMeta = metas.at(-1);

  return {
    ...currentMeta,
    layout: resolveLayout(matches),
  };
}
