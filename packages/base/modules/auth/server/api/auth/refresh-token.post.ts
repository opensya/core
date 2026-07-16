import { UnauthorizedError } from "@opensya/core/error/utils";
import crypto from "node:crypto";
import { verify } from "argon2";
import { setTokensCookie } from "../../utils/auth.ts";

export default defineRouteHandler(
  async (request, reply) => {
    const refreshToken = request.cookies.refresh_token as string;

    const auths = await database.engine.findMany("auths", {
      where: {
        conditions: [{ field: "revokedAt", operator: "isNull" }],
      },
      populate: ["user"],
    });

    const auth = await asyncFind(auths, async (item) => {
      return verify(refreshToken, item.tokenHash);
    });

    if (!auth) throw new UnauthorizedError("Invalid refresh token");

    if (auth.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const accessToken = await reply.jwtSign(
      { authId: auth.id, userId: (auth as any).id },
      { expiresIn: "15m" },
    );

    await database.engine.updateOne(
      "auths",
      {
        conditions: [
          { field: "id", operator: "eq", value: request.user.authId },
        ],
      },
      { revokedAt: new Date(), version: auth.version },
      { user: (auth as any).user },
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    await database.engine.create(
      "auths",
      { userId: (auth as any).user.id, tokenHash: newRefreshToken },
      { user: (auth as any).user },
    );

    setTokensCookie(reply, accessToken, newRefreshToken);

    return { success: true };
  },
  { config: { publicRoute: true } },
);

async function asyncFind<T>(
  items: T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<T | undefined> {
  for (const item of items) {
    if (await predicate(item)) return item;
  }

  return undefined;
}
