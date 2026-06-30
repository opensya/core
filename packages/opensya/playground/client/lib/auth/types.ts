/** Permission atomique : "resource:action" */
export type PermissionSlug = `${string}:${string}`;

export interface UserRoleSnapshot {
  slug: string;
  permissions: PermissionSlug[];
}

export interface UserAuthorization {
  /** Rôle org-level — toujours présent pour un user authentifié */
  orgRole: UserRoleSnapshot;

  /** Rôles par équipe, si le user appartient à des teams. Clé = teamId */
  teamRoles?: Record<string, UserRoleSnapshot>;
}
