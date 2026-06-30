import { useMatches } from "react-router-dom";

export interface PageMeta {
  name?: string;
  layout?: string | false | { name: string; [key: string]: unknown };
  auth?: boolean;
  roles?: `${string}:${string}`[];
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

function resolveAuth(
  matches: Array<{ handle?: RouteHandle }>,
): PageMeta["auth"] {
  for (let i = matches.length - 1; i >= 0; i--) {
    const auth = matches[i].handle?.meta?.auth;
    if (auth === true) return auth;
  }

  return undefined;
}

function resolveRoles(
  matches: Array<{ handle?: RouteHandle }>,
): PageMeta["roles"] {
  const roles = new Set<`${string}:${string}`[][number]>();

  for (let i = matches.length - 1; i >= 0; i--) {
    const currentRoles = matches[i].handle?.meta?.roles;

    if (currentRoles) {
      currentRoles.forEach((role) => roles.add(role));
    }
  }

  return [...roles];
}

export function usePageMeta(): PageMeta {
  const matches = useMatches() as Array<{ handle?: RouteHandle }>;

  const metas = matches
    .map((match) => match.handle?.meta)
    .filter(Boolean) as PageMeta[];

  const currentMeta = metas.at(-1);

  return {
    ...currentMeta,
    auth: resolveAuth(matches),
    layout: resolveLayout(matches),
    roles: resolveRoles(matches),
  };
}
