import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth";
import type { PermissionSlug } from "./types";

export function usePermissions(): Set<PermissionSlug> {
  const { meta } = useAuth();

  return useMemo(() => {
    const authorization = meta;
    if (!authorization) return new Set<PermissionSlug>();

    const all = new Set<PermissionSlug>(
      authorization.orgRole.permissions as PermissionSlug[],
    );

    if (authorization.teamRoles) {
      for (const role of Object.values(authorization.teamRoles)) {
        for (const slug of role.permissions) {
          all.add(slug as PermissionSlug);
        }
      }
    }

    return all;
  }, [meta]);
}

export function useHasAnyPermission(
  slugs: PermissionSlug[] | undefined,
): boolean {
  const permissions = usePermissions();

  return useMemo(() => {
    if (!slugs || slugs.length === 0) return true;
    return slugs.some((slug) => permissions.has(slug));
  }, [permissions, slugs]);
}
