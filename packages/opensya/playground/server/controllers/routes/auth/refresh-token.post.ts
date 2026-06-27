import {
  db,
  defineRoute,
  tables,
  UnauthorizedError,
  orm,
} from "../../../../../src/server";
import {
  createRefreshToken,
  getRefreshTokenExpiration,
  hashRefreshToken,
  setTokensCookie,
  verifyRefreshToken,
} from "../../../tools/auth";

export default defineRoute(
  async (request, reply) => {
    const refreshToken = request.cookies.refresh_token as string;

    const tokens = await db
      .select()
      .from(tables.auth)
      .where(orm.isNull(tables.auth.revokedAt));

    const matchedToken = await asyncFind(tokens, async (item) => {
      return verifyRefreshToken(refreshToken, item.tokenHash);
    });

    if (!matchedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const accessToken = await reply.jwtSign(
      { sub: matchedToken.userId },
      { expiresIn: "15m" },
    );

    const newRefreshToken = createRefreshToken();

    await db
      .update(tables.auth)
      .set({
        revokedAt: new Date(),
      })
      .where(orm.eq(tables.auth.id, matchedToken.id));

    await db.insert(tables.auth).values({
      userId: matchedToken.userId,
      tokenHash: await hashRefreshToken(newRefreshToken),
      expiresAt: getRefreshTokenExpiration(),
    });

    setTokensCookie(reply, accessToken, newRefreshToken);

    return { accessToken };
  },
  { publicRoute: true },
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
