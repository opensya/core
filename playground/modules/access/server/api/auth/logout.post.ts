import { UnauthorizedError } from "#core/error/utils.ts";
import { verify } from "argon2";

export default defineRouteHandler(
  async (request) => {
    if (!request.user?.sub) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const refreshToken = request.cookies.refresh_token as string;

    const auth = await database.engine.findOne("auths", {
      where: {
        conditions: [{ field: "id", operator: "eq", value: request.user.sub }],
      },
      populate: ["user"],
    });

    if (!auth || !(await verify(auth.tokenHash, refreshToken))) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    await database.engine.updateOne(
      "auths",
      {
        conditions: [{ field: "id", operator: "eq", value: request.user.sub }],
      },
      { revokedAt: new Date() },
      { user: (auth as any).user },
    );

    return { success: true };
  },

  // { publicRoute: true },
);
