import { UnauthorizedError } from "#core/error/utils.js";
import { verify } from "argon2";
import crypto from "node:crypto";
import { setTokensCookie } from "../../../utils/auth.ts";

interface LoginBody {
  email: string;
  password: string;
}

export default defineRouteHandler(
  async (request, reply) => {
    const body = request.body as LoginBody;

    const user = await database.engine.internal.findOne("users", {
      where: {
        conditions: [{ field: "email", operator: "eq", value: body.email }],
      },
    });

    if (!user) throw new UnauthorizedError("Invalid credentials");
    if (!user.password) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await verify(user.password, body.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    const refreshToken = crypto.randomBytes(64).toString("hex");

    const auth = await database.engine.create(
      "auths",
      { userId: user.id, tokenHash: refreshToken },
      { user },
    );

    const accessToken = await reply.jwtSign(
      { userId: user.id, authId: auth.id },
      { expiresIn: "15m" },
    );
    setTokensCookie(reply, accessToken, refreshToken);

    return { success: true };
  },

  {
    config: { publicRoute: true },

    schema: {
      body: {
        type: "object",

        required: ["email", "password"],

        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
      },
    },
  },
);
