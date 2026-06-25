import { useMatches } from "react-router-dom";

export interface PageMeta {
  name?: string;
  layout?: string | false | { name: string; [key: string]: unknown };
}

interface PageMetaContext {
  _meta?: PageMeta;
}

let currentPageMetaContext: PageMetaContext | null = null;

export function definePageMeta(meta: PageMeta): PageMeta {
  if (currentPageMetaContext) {
    currentPageMetaContext._meta = meta;
  }

  return meta;
}

interface RouteHandle {
  meta?: PageMeta;
}

export async function withPageMetaContext<T>(
  context: PageMetaContext,
  callback: () => Promise<T>,
): Promise<T> {
  const previousContext = currentPageMetaContext;

  currentPageMetaContext = context;

  try {
    return await callback();
  } finally {
    currentPageMetaContext = previousContext;
  }
}

export function usePageMeta(): PageMeta | undefined {
  const matches = useMatches();

  const match = matches.at(-1) as { handle?: RouteHandle } | undefined;

  return match?.handle?.meta;
}
