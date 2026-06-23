import { registerRoutes } from "./routes/register";
import type { FastifyInstance } from "fastify";

export async function registerControllers(app: FastifyInstance) {
  await registerRoutes(app);
}
