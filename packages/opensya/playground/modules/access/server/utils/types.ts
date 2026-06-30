// ─────────────────────────────────────────────────────────────────────────────
// Types — Authorization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Slug d'une permission atomique.
 * Convention : "resource:action"
 * Ex : "job_posting:publish", "application:read", "member:invite"
 */
export type PermissionSlug = `${string}:${string}`; // & { readonly __brand: "PermissionSlug" };

export function permission(slug: `${string}:${string}`): PermissionSlug {
  return slug as PermissionSlug;
}

// ─── Actor ───────────────────────────────────────────────────────────────────

/**
 * Représente l'utilisateur authentifié avec ses rôles résolus.
 * Construit par AuthorizationService.resolveActor() à partir du JWT.
 */
export interface Actor {
  userId: string;

  /** Rôle org-level (toujours présent si l'user est membre de l'instance) */
  orgRole: ResolvedRole;

  /** Rôles par équipe — clé = teamId */
  teamRoles: Map<string, ResolvedRole>;
}

export interface ResolvedRole {
  roleId: string;
  slug: string;
  permissions: Set<PermissionSlug>;
}

// ─── Check context ────────────────────────────────────────────────────────────

/**
 * Contexte optionnel passé à can() pour les checks scoped à une équipe.
 *
 * Exemple :
 *   can(actor, 'application:read', { teamId: 'xxx' })
 *   → vérifie d'abord le rôle de l'actor dans cette équipe,
 *     puis fallback sur le rôle org-level.
 */
export interface AuthContext {
  teamId?: string;
}

// ─── Résultat d'un check ──────────────────────────────────────────────────────

export type AuthResult =
  | { granted: true; via: "org_role" | "team_role"; roleSlug: string }
  | {
      granted: false;
      reason: "not_member" | "permission_denied" | "unauthenticated";
    };
