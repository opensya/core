import { definePlugin } from "@core/server";

import type { FastifyInstance } from "fastify";
import {
  ROLE_PERMISSIONS,
  SYSTEM_PERMISSIONS,
  SYSTEM_ROLES,
} from "../utils/seed";

export default definePlugin(async (app: FastifyInstance) => {
  const { db, tables, orm } = await import("@core/server");

  app.log.info("[authorization] seeding system roles and permissions...");

  // ── 1. Upsert des rôles système ───────────────────────────────────────────
  //
  // ON CONFLICT DO NOTHING : si le slug existe déjà, on ne touche à rien.
  // Le nom et la description ne sont jamais écrasés (un admin peut les avoir modifiés).

  await db
    .insert(tables.roles)
    .values(
      SYSTEM_ROLES.map((role) => ({
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: true,
      })),
    )
    .onConflictDoNothing({ target: tables.roles.slug });

  // ── 2. Upsert des permissions atomiques ───────────────────────────────────

  await db
    .insert(tables.permissions)
    .values(
      SYSTEM_PERMISSIONS.map((p) => ({
        resource: p.resource,
        action: p.action,
        slug: `${p.resource}:${p.action}`,
      })),
    )
    .onConflictDoNothing({ target: tables.permissions.slug });

  // ── 3. Sync role_permissions ──────────────────────────────────────────────
  //
  // On récupère les slugs → ids depuis la DB (source de vérité après les upserts),
  // puis on insère uniquement les liaisons manquantes.

  const [rolesInDb, permissionsInDb] = await Promise.all([
    db
      .select({ id: tables.roles.id, slug: tables.roles.slug })
      .from(tables.roles)
      .where(orm.eq(tables.roles.isSystem, true)),

    db
      .select({ id: tables.permissions.id, slug: tables.permissions.slug })
      .from(tables.permissions),
  ]);

  const roleIdBySlug = new Map(rolesInDb.map((r) => [r.slug, r.id]));
  const permIdBySlug = new Map(permissionsInDb.map((p) => [p.slug, p.id]));

  // Construire toutes les paires (roleId, permissionId) attendues
  const expectedPairs: { roleId: string; permissionId: string }[] = [];

  for (const [roleSlug, permSlugs] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleIdBySlug.get(roleSlug);
    if (!roleId) {
      app.log.warn(
        `[authorization] role "${roleSlug}" not found in DB after seed — skipping`,
      );
      continue;
    }

    for (const permSlug of permSlugs) {
      const permissionId = permIdBySlug.get(permSlug);
      if (!permissionId) {
        app.log.warn(
          `[authorization] permission "${permSlug}" not found in DB after seed — skipping`,
        );
        continue;
      }

      expectedPairs.push({ roleId, permissionId });
    }
  }

  if (expectedPairs.length > 0) {
    await db
      .insert(tables.rolePermissions)
      .values(expectedPairs)
      .onConflictDoNothing();
  }

  app.log.info(
    `[authorization] seed complete — ${rolesInDb.length} roles, ` +
      `${permissionsInDb.length} permissions, ` +
      `${expectedPairs.length} role_permissions ensured`,
  );
});
