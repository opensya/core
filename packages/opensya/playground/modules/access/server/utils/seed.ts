// ─────────────────────────────────────────────
// Seed — rôles système + permissions built-in
// À exécuter une seule fois à l'initialisation
// de l'instance OpenSya.
// ─────────────────────────────────────────────

// Rôles système (is_system = true, non modifiables)
export const SYSTEM_ROLES = [
  {
    slug: "owner",
    name: "Owner",
    description: "Accès total à l'instance. Unique, non révocable.",
  },
  {
    slug: "admin",
    name: "Admin",
    description:
      "Gestion complète de l'organisation, des membres et des rôles.",
  },
  {
    slug: "recruiter",
    name: "Recruiter",
    description: "Création et gestion des offres et pipelines de recrutement.",
  },
  {
    slug: "hiring_manager",
    name: "Hiring Manager",
    description:
      "Lecture, feedback et décisions sur les candidatures assignées.",
  },
  {
    slug: "viewer",
    name: "Viewer",
    description: "Lecture seule sur les ressources visibles.",
  },
] as const;

export type SystemRoleSlug = (typeof SYSTEM_ROLES)[number]["slug"];

// Permissions atomiques : resource:action
// Étendre cette liste au fur et à mesure des ressources OpenSya.
export const SYSTEM_PERMISSIONS = [
  // ── Job postings
  { resource: "job_posting", action: "create" },
  { resource: "job_posting", action: "read" },
  { resource: "job_posting", action: "update" },
  { resource: "job_posting", action: "delete" },
  { resource: "job_posting", action: "publish" },
  { resource: "job_posting", action: "archive" },

  // ── Applications (candidatures)
  { resource: "application", action: "create" },
  { resource: "application", action: "read" },
  { resource: "application", action: "update" },
  { resource: "application", action: "delete" },
  { resource: "application", action: "assign" }, // assigner à un recruteur / hiring manager

  // ── Pipelines
  { resource: "pipeline", action: "create" },
  { resource: "pipeline", action: "read" },
  { resource: "pipeline", action: "update" },
  { resource: "pipeline", action: "delete" },

  // ── Teams
  { resource: "team", action: "create" },
  { resource: "team", action: "read" },
  { resource: "team", action: "update" },
  { resource: "team", action: "delete" },

  // ── Members (gestion des utilisateurs de l'instance)
  { resource: "member", action: "invite" },
  { resource: "member", action: "read" },
  { resource: "member", action: "update" },
  { resource: "member", action: "remove" },

  // ── Files / médias
  { resource: "file", action: "upload" },
  { resource: "file", action: "read" },
  { resource: "file", action: "delete" },

  // ── Settings (configuration de l'instance)
  { resource: "settings", action: "read" },
  { resource: "settings", action: "update" },
] as const;

export type PermissionSlug =
  `${(typeof SYSTEM_PERMISSIONS)[number]["resource"]}:${(typeof SYSTEM_PERMISSIONS)[number]["action"]}`;

// Matrice rôle → permissions
// Facile à lire, facile à auditer, facile à étendre.
export const ROLE_PERMISSIONS: Record<SystemRoleSlug, PermissionSlug[]> = {
  owner: [
    // owner hérite de tout
    "job_posting:create",
    "job_posting:read",
    "job_posting:update",
    "job_posting:delete",
    "job_posting:publish",
    "job_posting:archive",
    "application:create",
    "application:read",
    "application:update",
    "application:delete",
    "application:assign",
    "pipeline:create",
    "pipeline:read",
    "pipeline:update",
    "pipeline:delete",
    "team:create",
    "team:read",
    "team:update",
    "team:delete",
    "member:invite",
    "member:read",
    "member:update",
    "member:remove",
    "file:upload",
    "file:read",
    "file:delete",
    "settings:read",
    "settings:update",
  ],

  admin: [
    "job_posting:create",
    "job_posting:read",
    "job_posting:update",
    "job_posting:delete",
    "job_posting:publish",
    "job_posting:archive",
    "application:create",
    "application:read",
    "application:update",
    "application:delete",
    "application:assign",
    "pipeline:create",
    "pipeline:read",
    "pipeline:update",
    "pipeline:delete",
    "team:create",
    "team:read",
    "team:update",
    "team:delete",
    "member:invite",
    "member:read",
    "member:update",
    "member:remove",
    "file:upload",
    "file:read",
    "file:delete",
    "settings:read",
    "settings:update",
    // admin ne peut pas supprimer l'owner → géré dans le service, pas ici
  ],

  recruiter: [
    "job_posting:create",
    "job_posting:read",
    "job_posting:update",
    "job_posting:publish",
    "job_posting:archive",
    "application:create",
    "application:read",
    "application:update",
    "application:assign",
    "pipeline:create",
    "pipeline:read",
    "pipeline:update",
    "team:read",
    "member:read",
    "file:upload",
    "file:read",
    "file:delete",
  ],

  hiring_manager: [
    "job_posting:read",
    "application:read",
    "application:update", // update = ajouter feedback/décision
    "pipeline:read",
    "team:read",
    "member:read",
    "file:read",
  ],

  viewer: [
    "job_posting:read",
    "application:read",
    "pipeline:read",
    "team:read",
    "member:read",
    "file:read",
  ],
};
