export const SYSTEM_ROLES = [
  {
    slug: "owner",
    name: "Owner",
    description:
      "Has full access to the instance. This role is unique and cannot be revoked.",
  },
  {
    slug: "admin",
    name: "Admin",
    description:
      "Manages the organization, members, roles, and instance configuration.",
  },
  {
    slug: "recruiter",
    name: "Recruiter",
    description:
      "Creates and manages job postings, recruitment pipelines, and applications.",
  },
  {
    slug: "hiring_manager",
    name: "Hiring Manager",
    description:
      "Reviews assigned applications, provides feedback, and makes hiring decisions.",
  },
  {
    slug: "viewer",
    name: "Viewer",
    description: "Has read-only access to resources they are allowed to view.",
  },
  {
    slug: "anonymous",
    name: "Anonymous",
    description:
      "Represents unauthenticated users with access only to public resources.",
  },
  {
    slug: "system",
    name: "System",
    description:
      "Represents internal system processes and automated operations.",
  },
] as const;

export type ActorType = (typeof SYSTEM_ROLES)[number]["slug"];

export type ResourceAction =
  | "job_posting:create"
  | "job_posting:read"
  | "job_posting:update"
  | "job_posting:delete"
  | "job_posting:publish"
  | "job_posting:archive"
  | "application:create"
  | "application:read"
  | "application:update"
  | "application:delete"
  | "application:assign"
  | "pipeline:create"
  | "pipeline:read"
  | "pipeline:update"
  | "pipeline:delete"
  | "team:create"
  | "team:read"
  | "team:update"
  | "team:delete"
  | "member:invite"
  | "member:read"
  | "member:update"
  | "member:remove"
  | "file:upload"
  | "file:read"
  | "file:delete"
  | "settings:read"
  | "settings:update";

export const PERMISSION_ACTORS = {
  "job_posting:create": ["owner", "admin", "recruiter"],
  "job_posting:read": [
    "owner",
    "admin",
    "recruiter",
    "hiring_manager",
    "viewer",
  ],
  "job_posting:update": ["owner", "admin", "recruiter"],
  "job_posting:delete": ["owner", "admin"],
  "job_posting:publish": ["owner", "admin", "recruiter"],
  "job_posting:archive": ["owner", "admin", "recruiter"],

  "application:create": ["owner", "admin", "recruiter"],
  "application:read": [
    "owner",
    "admin",
    "recruiter",
    "hiring_manager",
    "viewer",
  ],
  "application:update": ["owner", "admin", "recruiter", "hiring_manager"],
  "application:delete": ["owner", "admin", "recruiter"],
  "application:assign": ["owner", "admin", "recruiter"],

  "pipeline:create": ["owner", "admin", "recruiter"],
  "pipeline:read": ["owner", "admin", "recruiter", "hiring_manager", "viewer"],
  "pipeline:update": ["owner", "admin", "recruiter"],
  "pipeline:delete": ["owner", "admin"],

  "team:create": ["owner", "admin"],
  "team:read": ["owner", "admin", "recruiter", "hiring_manager", "viewer"],
  "team:update": ["owner", "admin"],
  "team:delete": ["owner", "admin"],

  "member:invite": ["owner", "admin"],
  "member:read": ["owner", "admin", "recruiter", "hiring_manager", "viewer"],
  "member:update": ["owner", "admin"],
  "member:remove": ["owner", "admin"],

  "file:upload": ["owner", "admin", "recruiter"],
  "file:read": ["owner", "admin", "recruiter", "hiring_manager", "viewer"],
  "file:delete": ["owner", "admin", "recruiter"],

  "settings:read": ["owner", "admin"],
  "settings:update": ["owner", "admin"],
} satisfies Record<ResourceAction, ActorType[]>;
