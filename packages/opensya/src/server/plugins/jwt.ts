// server/plugins/jwt.ts
import fp from "fastify-plugin";
import fastifyJw from "@fastify/jwt";

export const jwt = fp(async (app) => {
  await app.register(fastifyJw, {
    secret: process.env.SECRET_KEY ?? "dev-secret-change-me",
  });

  app.decorate("authenticate", async (request) => {
    await request.jwtVerify();
  });
});

export interface AuthUser {
  sub: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };

    user: AuthUser;
  }
}
