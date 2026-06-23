// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthUser {}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
