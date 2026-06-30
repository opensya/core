import { usePermissions } from "./use-permissions";
import type { PermissionSlug } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// useCan
// ─────────────────────────────────────────────────────────────────────────────
//
// Pour les checks granulaires dans le JSX, distincts de RoleGuard
// (qui protège une page entière). Usage typique : masquer un bouton,
// désactiver une action.
//
//   const canPublish = useCan('job_posting:publish')
//   return <Button disabled={!canPublish}>Publier</Button>
//
// Pour plusieurs permissions en OR, passer un tableau :
//
//   const canManage = useCan(['job_posting:update', 'job_posting:delete'])

export function useCan(slug: PermissionSlug | PermissionSlug[]): boolean {
  const permissions = usePermissions();
  const slugs = Array.isArray(slug) ? slug : [slug];

  return slugs.some((s) => permissions.has(s));
}
