import type {
  Actor,
  AuthContext,
  AuthResult,
  PermissionSlug,
} from "./types.ts";
import { permissionCache } from "./permission-cache.ts";
import { ForbiddenError, UnauthorizedError } from "#core/error/index.js";

export class AuthorizationService {
  /**
   * Construit un Actor complet à partir d’un userId issu du JWT.
   *
   * Charge :
   * - le membership global avec son rôle ;
   * - les appartenances aux équipes avec leurs rôles.
   *
   * Retourne null lorsque l’utilisateur n’est plus membre de l’instance.
   */
  async resolveActor(userId: string): Promise<Actor | null> {
    await permissionCache.load();

    const membership = await database.engine.findOne("memberships", {
      where: {
        conditions: [
          {
            field: "userId",
            operator: "eq",
            value: userId,
          },
        ],
      },
    });

    if (!membership) {
      return null;
    }

    const orgRole = permissionCache.getRole(membership.roleId);

    if (!orgRole) {
      return null;
    }

    const teamMemberships = await database.engine.findMany("team_memberships", {
      where: {
        conditions: [
          {
            field: "userId",
            operator: "eq",
            value: userId,
          },
        ],
      },
    });

    const teamRoles = new Map<string, typeof orgRole>();

    for (const membership of teamMemberships) {
      /*
       * Sans rôle spécifique, l’utilisateur hérite de son rôle global
       * dans cette équipe.
       *
       * Si le rôle référencé n’existe plus dans le cache, on utilise
       * également le rôle global.
       */
      const role = membership.roleId
        ? (permissionCache.getRole(membership.roleId) ?? orgRole)
        : orgRole;

      teamRoles.set(membership.teamId, role);
    }

    return {
      userId,
      orgRole,
      teamRoles,
    };
  }

  /**
   * Vérifie si un acteur possède une permission.
   *
   * Résolution :
   * 1. rôle associé à l’équipe ;
   * 2. rôle global si l’acteur appartient à l’équipe ;
   * 3. refus.
   */
  check(
    actor: Actor | null,
    slug: PermissionSlug,
    context?: AuthContext,
  ): AuthResult {
    if (!actor) {
      return {
        granted: false,
        reason: "unauthenticated",
      };
    }

    if (context?.teamId) {
      const teamRole = actor.teamRoles.get(context.teamId);

      if (teamRole?.permissions.has(slug)) {
        return {
          granted: true,
          via: "team_role",
          roleSlug: teamRole.slug,
        };
      }

      /*
       * L’acteur n’appartient pas à l’équipe.
       *
       * Le rôle global ne doit pas permettre d’accéder à une équipe dont
       * l’acteur n’est pas membre.
       */
      if (!teamRole) {
        return {
          granted: false,
          reason: "not_member",
        };
      }
    }

    if (actor.orgRole.permissions.has(slug)) {
      return {
        granted: true,
        via: "org_role",
        roleSlug: actor.orgRole.slug,
      };
    }

    return {
      granted: false,
      reason: "permission_denied",
    };
  }

  /**
   * Vérifie une permission et déclenche une erreur lorsqu’elle est refusée.
   */
  assert(
    actor: Actor | null,
    slug: PermissionSlug,
    context?: AuthContext,
  ): asserts actor is Actor {
    if (!actor) {
      throw new UnauthorizedError();
    }

    const result = this.check(actor, slug, context);

    if (!result.granted) {
      throw new ForbiddenError(`Missing permission "${slug}"`);
    }
  }

  /**
   * Vérifie que toutes les permissions sont accordées.
   */
  assertAll(
    actor: Actor | null,
    slugs: PermissionSlug[],
    context?: AuthContext,
  ): asserts actor is Actor {
    if (!actor) {
      throw new UnauthorizedError();
    }

    for (const slug of slugs) {
      this.assert(actor, slug, context);
    }
  }

  /**
   * Vérifie qu’au moins une permission est accordée.
   */
  checkAny(
    actor: Actor | null,
    slugs: PermissionSlug[],
    context?: AuthContext,
  ): boolean {
    if (!actor) {
      return false;
    }

    return slugs.some((slug) => this.check(actor, slug, context).granted);
  }

  /**
   * Vérifie le rôle global de l’acteur.
   *
   * Les vérifications par permission restent préférables.
   */
  isRole(actor: Actor | null, roleSlug: string): boolean {
    return actor?.orgRole.slug === roleSlug;
  }
}

export const authorizationService = new AuthorizationService();
