import type { FastifyInstance } from "fastify";
import { PERMISSION_ACTORS, SYSTEM_ROLES } from "../utils/seed.ts";

export default definePlugin(async (app) => {});

async function toOptimise(app: FastifyInstance) {
  function buildSystemPermissions<T extends Record<string, readonly string[]>>(
    permissionActors: T,
  ) {
    return Object.keys(permissionActors).map((slug) => {
      const [resource, action] = slug.split(":");

      if (!resource || !action) {
        throw new Error(
          `Invalid permission "${slug}". Expected format "resource:action".`,
        );
      }

      return {
        resource,
        action,
        slug,
      };
    });
  }

  const SYSTEM_PERMISSIONS = buildSystemPermissions(PERMISSION_ACTORS);

  await database.engine.transaction({}, async (tx) => {
    let roles = await tx.findMany("roles");
    const roleSlugs = roles.map((role) => role.slug);

    let permissions = await tx.findMany("permissions");
    const permissionSlugs = permissions.map((perm) => perm.slug);

    for (const role of SYSTEM_ROLES.filter(
      (sRole) => !roleSlugs.includes(sRole.slug),
    )) {
      await tx.create("roles", {
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: true,
      });
    }

    for (const permission of SYSTEM_PERMISSIONS.filter(
      (sPerm) => !permissionSlugs.includes(sPerm.slug),
    )) {
      await tx.create("permissions", permission);
    }

    roles = await tx.findMany("roles", {
      where: {
        conditions: [
          {
            field: "isSystem",
            operator: "eq",
            value: true,
          },
        ],
      },
    });

    permissions = await tx.findMany("permissions");

    const roleIdBySlug = new Map(roles.map((role) => [role.slug, role.id]));
    const permissionIdBySlug = new Map(
      permissions.map((permission) => [permission.slug, permission.id]),
    );

    for (const [permissionSlug, actors] of Object.entries(PERMISSION_ACTORS)) {
      const permissionId = permissionIdBySlug.get(permissionSlug);

      if (!permissionId) continue;

      for (const actor of actors) {
        const roleId = roleIdBySlug.get(actor);

        if (!roleId) continue;

        await tx.create("role_permissions", {
          roleId,
          permissionId,
        });
      }
    }
  });

  app.log.info("[authorization] seed completed");
}
