import type { Actor, AuthContext, AuthResult, PermissionSlug } from "./types";
import { permissionCache } from "./permission_cache";
import { ForbiddenError, UnauthorizedError } from "@core/server";

// ─────────────────────────────────────────────────────────────────────────────
// AuthorizationService
// ─────────────────────────────────────────────────────────────────────────────

export class AuthorizationService {
  // ─── Résolution de l'actor ─────────────────────────────────────────────────

  /**
   * Construit un Actor complet à partir d'un userId (issu du JWT).
   *
   * Charge :
   *  - le membership org-level avec son rôle
   *  - tous les team_memberships avec leurs rôles
   *
   * Retourne null si l'user n'est pas membre de l'instance
   * (compte supprimé, invitation révoquée, etc.)
   */
  async resolveActor(userId: string): Promise<Actor | null> {
    const { orm } = await import("@core/server");

    // ── Membership org-level
    const [membership] = await db
      .select({
        roleId: tables.memberships.roleId,
      })
      .from(tables.memberships)
      .where(orm.eq(tables.memberships.userId, userId))
      .limit(1);

    if (!membership) return null;

    const orgRole = permissionCache.getRole(membership.roleId);
    if (!orgRole) return null;

    // ── Team memberships
    const teamRows = await db
      .select({
        teamId: tables.teamMemberships.teamId,
        roleId: tables.teamMemberships.roleId,
      })
      .from(tables.teamMemberships)
      .where(orm.eq(tables.teamMemberships.userId, userId));

    const teamRoles = new Map<string, typeof orgRole>();

    for (const row of teamRows) {
      // roleId nullable → si null, on stocke le rôle org-level pour cette équipe
      const role = row.roleId
        ? (permissionCache.getRole(row.roleId) ?? orgRole)
        : orgRole;

      teamRoles.set(row.teamId, role);
    }

    return { userId, orgRole, teamRoles };
  }

  // ─── Check principal ───────────────────────────────────────────────────────

  /**
   * Vérifie si un actor a une permission, avec contexte optionnel.
   *
   * Logique de résolution :
   *  1. Si teamId fourni → cherche le rôle de l'actor dans cette équipe
   *     → si trouvé et que ce rôle a la permission : granted via 'team_role'
   *     → sinon : fallback sur le rôle org-level
   *  2. Rôle org-level → si permission trouvée : granted via 'org_role'
   *  3. Sinon : denied
   */
  check(
    actor: Actor | null,
    slug: PermissionSlug,
    context?: AuthContext,
  ): AuthResult {
    if (!actor) {
      return { granted: false, reason: "unauthenticated" };
    }

    // ── Résolution via rôle d'équipe (si teamId fourni)
    if (context?.teamId) {
      const teamRole = actor.teamRoles.get(context.teamId);

      if (teamRole?.permissions.has(slug)) {
        return { granted: true, via: "team_role", roleSlug: teamRole.slug };
      }

      // Pas de rôle dans cette équipe du tout → l'actor n'est pas membre de l'équipe.
      // On ne fallback PAS sur org_role dans ce cas — un hiring_manager
      // ne doit pas accéder aux candidatures d'une équipe dont il ne fait pas partie.
      if (!teamRole) {
        return { granted: false, reason: "not_member" };
      }

      // L'actor est dans l'équipe mais le rôle team-level n'a pas la permission
      // → fallback org_role (comportement d'héritage)
    }

    // ── Résolution via rôle org-level
    if (actor.orgRole.permissions.has(slug)) {
      return { granted: true, via: "org_role", roleSlug: actor.orgRole.slug };
    }

    return { granted: false, reason: "permission_denied" };
  }

  /**
   * Comme check() mais throw ForbiddenError si non accordé.
   * Pratique dans les handlers pour un early return propre.
   */
  assert(
    actor: Actor | null,
    slug: PermissionSlug,
    context?: AuthContext,
  ): asserts actor is Actor {
    if (!actor) throw new UnauthorizedError();

    const result = this.check(actor, slug, context);

    if (!result.granted) {
      throw new ForbiddenError(`Missing permission "${slug}"`);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Vérifie plusieurs permissions en une fois (toutes requises).
   * Utile pour les actions composites.
   *
   * Ex : assertAll(actor, ['job_posting:create', 'file:upload'])
   */
  assertAll(
    actor: Actor | null,
    slugs: PermissionSlug[],
    context?: AuthContext,
  ): asserts actor is Actor {
    if (!actor) throw new UnauthorizedError();

    for (const slug of slugs) {
      this.assert(actor, slug, context);
    }
  }

  /**
   * Vérifie si l'actor a au moins une des permissions listées.
   */
  checkAny(
    actor: Actor | null,
    slugs: PermissionSlug[],
    context?: AuthContext,
  ): boolean {
    if (!actor) return false;
    return slugs.some((slug) => this.check(actor, slug, context).granted);
  }

  /**
   * Vérifie si l'actor a un rôle système donné.
   * À utiliser avec parcimonie — préférer les permissions aux rôles dans les checks.
   *
   * Ex : isRole(actor, 'owner') pour les actions admin système
   */
  isRole(actor: Actor | null, roleSlug: string): boolean {
    if (!actor) return false;
    return actor.orgRole.slug === roleSlug;
  }
}

export const authorizationService: AuthorizationService =
  new AuthorizationService();
