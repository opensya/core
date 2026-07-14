import fp from "fastify-plugin";
import fastifyJw from "@fastify/jwt";

export default fp(async (app) => {
  await app.register(fastifyJw, {
    secret: process.env.SECRET_KEY ?? "dev-secret-change-me",

    cookie: {
      cookieName: "access_token",
      signed: false,
    },
  });

  app.addHook("onRequest", async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      request.user = null as unknown as AuthUser;
    }
  });

  app.decorate("authenticate", async (request) => {
    await request.jwtVerify();
  });
});

export interface AuthUser {
  userId: string;
  authId: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}
