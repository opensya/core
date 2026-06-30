import {
  db,
  defineRoute,
  tables,
  UnauthorizedError,
  orm,
} from "../../../../../src/server";
import bcrypt from "bcryptjs";
import {
  createRefreshToken,
  getRefreshTokenExpiration,
  hashRefreshToken,
  setTokensCookie,
} from "../../../tools/auth";
import { _ } from "@opensya/utils";

interface LoginBody {
  email: string;
  password: string;
}

export default defineRoute(
  async (request, reply) => {
    const body = request.body as LoginBody;

    const [user] = await db
      .select()
      .from(tables.users)
      .where(orm.eq(tables.users.email, body.email));

    if (!user) throw new UnauthorizedError("Invalid credentials");
    if (!user.password) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    _.unset(user, "password");

    const accessToken = await reply.jwtSign({ sub: user.id });
    const refreshToken = createRefreshToken();

    await db.insert(tables.auth).values({
      userId: user.id,
      tokenHash: await hashRefreshToken(refreshToken),
      expiresAt: getRefreshTokenExpiration(),
    });

    setTokensCookie(reply, accessToken, refreshToken);

    return { success: true };
  },

  {
    publicRoute: true,

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
