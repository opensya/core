import {
  db,
  defineRoute,
  tables,
  UnauthorizedError,
  orm,
} from "../../../../src/server";
import {
  createRefreshToken,
  getRefreshTokenExpiration,
  hashRefreshToken,
  verifyRefreshToken,
} from "../../tools/auth";

interface RefreshBody {
  refreshToken: string;
}

export default defineRoute(
  async (request, reply) => {
    const body = request.body as RefreshBody;

    const tokens = await db
      .select()
      .from(tables.session)
      .where(orm.isNull(tables.session.revokedAt));

    const matchedToken = await asyncFind(tokens, async (item) => {
      return verifyRefreshToken(body.refreshToken, item.tokenHash);
    });

    if (!matchedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const accessToken = reply.jwtSign(
      { sub: matchedToken.userId },
      { expiresIn: "15m" },
    );

    const newRefreshToken = createRefreshToken();

    await db
      .update(tables.session)
      .set({
        revokedAt: new Date(),
      })
      .where(orm.eq(tables.session.id, matchedToken.id));

    await db.insert(tables.session).values({
      userId: matchedToken.userId,
      tokenHash: await hashRefreshToken(newRefreshToken),
      expiresAt: getRefreshTokenExpiration(),
    });

    return { accessToken, refreshToken: newRefreshToken };
  },
  {
    publicRoute: true,

    schema: {
      body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string", minLength: 64 },
        },
      },
    },
  },
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
