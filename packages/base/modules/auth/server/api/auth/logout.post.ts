import { UnauthorizedError } from "@opensya/core/error/utils";
import { verify } from "argon2";

export default defineRouteHandler(async (request) => {
  if (!request.actor) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const refreshToken = request.cookies.refresh_token as string;

  const auth = await database.engine.findOne("auths", {
    where: {
      conditions: [
        { field: "id", operator: "eq", value: request.user.authId },
        { field: "revokedAt", operator: "isNull" },
      ],
    },
    populate: ["user"],
  });

  if (!auth || !(await verify(auth.tokenHash, refreshToken))) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  await database.engine.updateOne(
    "auths",
    {
      conditions: [{ field: "id", operator: "eq", value: request.user.authId }],
    },
    { revokedAt: new Date(), version: auth.version },
    { user: (auth as any).user },
  );

  return { success: true };
});
