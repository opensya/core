import type { PermissionSlug, ResolvedRole } from "./types.ts";

interface RoleWithPermissions {
  id: string;
  slug: ResolvedRole["slug"];
  permissions: Array<{
    slug: PermissionSlug;
  }>;
}

/**
 * Charge et conserve en mémoire la matrice rôle → permissions.
 *
 * Le cache doit être invalidé avec refresh() après une modification de
 * role_permissions, roles ou permissions.
 */
export class PermissionCache {
  private cache = new Map<string, ResolvedRole>();
  private loaded = false;
  private loading?: Promise<void> | undefined;

  async load(): Promise<void> {
    if (this.loaded) return;

    // Évite plusieurs chargements simultanés.
    if (this.loading) {
      return this.loading;
    }

    this.loading = this.loadRoles();

    try {
      await this.loading;
      this.loaded = true;
    } finally {
      this.loading = undefined;
    }
  }

  private async loadRoles(): Promise<void> {
    const roles = await database.engine.findMany<RoleWithPermissions>("roles", {
      populate: ["permissions"],
    });

    const map = new Map<string, ResolvedRole>();

    for (const role of roles) {
      map.set(role.id, {
        roleId: role.id,
        slug: role.slug,
        permissions: new Set(
          role.permissions.map((permission) => permission.slug),
        ),
      });
    }

    this.cache = map;
  }

  /**
   * Force le rechargement.
   *
   * À appeler après une modification de roles, permissions
   * ou role_permissions.
   */
  async refresh(): Promise<void> {
    this.loaded = false;

    if (this.loading) {
      await this.loading;
    }

    await this.load();
  }

  getRole(roleId: string): ResolvedRole | undefined {
    return this.cache.get(roleId);
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const permissionCache = new PermissionCache();
