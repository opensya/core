import type { PermissionSlug, ResolvedRole } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// PermissionCache
// ─────────────────────────────────────────────────────────────────────────────
//
// Charge la matrice rôle → permissions une seule fois au démarrage
// (ou à la demande via refresh()).
//
// Pourquoi un cache ?
//   Les rôles et permissions sont quasi-statiques — ils ne changent que quand
//   un admin modifie la configuration, pas à chaque requête.
//   Évite un JOIN roles → role_permissions → permissions sur chaque can().
//
// Invalidation :
//   Appeler cache.refresh() après toute modification de role_permissions.

export class PermissionCache {
  /** Map roleId → ResolvedRole (avec permissions Set) */
  private cache = new Map<string, ResolvedRole>();
  private loaded = false;

  async load(): Promise<void> {
    const { db, tables, orm } = await import("@core/server");

    // Récupère tous les rôles avec leurs permissions en une seule query
    const rows = await db
      .select({
        roleId: tables.roles.id,
        roleSlug: tables.roles.slug,
        permissionSlug: tables.permissions.slug,
      })
      .from(tables.roles)
      .leftJoin(
        tables.rolePermissions,
        orm.eq(tables.rolePermissions.roleId, tables.roles.id),
      )
      .leftJoin(
        tables.permissions,
        orm.eq(tables.permissions.id, tables.rolePermissions.permissionId),
      );

    // Reconstruit la Map roleId → ResolvedRole
    const map = new Map<string, ResolvedRole>();

    for (const row of rows) {
      if (!map.has(row.roleId)) {
        map.set(row.roleId, {
          roleId: row.roleId,
          slug: row.roleSlug,
          permissions: new Set(),
        });
      }

      // leftJoin → permissionSlug peut être null si le rôle n'a pas de permissions
      if (row.permissionSlug) {
        map
          .get(row.roleId)!
          .permissions.add(row.permissionSlug as PermissionSlug);
      }
    }

    this.cache = map;
    this.loaded = true;
  }

  /** Force le rechargement — appeler après modification de role_permissions */
  async refresh(): Promise<void> {
    this.loaded = false;
    await this.load();
  }

  getRole(roleId: string): ResolvedRole | undefined {
    return this.cache.get(roleId);
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

// Singleton partagé dans l'instance
export const permissionCache = new PermissionCache();
