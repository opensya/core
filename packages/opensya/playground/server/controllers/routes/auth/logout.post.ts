import {
  db,
  defineRoute,
  tables,
  UnauthorizedError,
  orm,
} from "../../../../../src/server";
import { verifyRefreshToken } from "../../../tools/auth";

interface LogoutBody {
  refreshToken: string;
}

export default defineRoute(
  async (request) => {
    const body = request.body as LogoutBody;

    const tokens = await db
      .select()
      .from(tables.auth)
      .where(orm.isNull(tables.auth.revokedAt));

    const matchedToken = await asyncFind(tokens, async (item) => {
      return verifyRefreshToken(body.refreshToken, item.tokenHash);
    });

    if (!matchedToken) throw new UnauthorizedError("Invalid refresh token");

    await db
      .update(tables.auth)
      .set({
        revokedAt: new Date(),
      })
      .where(orm.eq(tables.auth.id, matchedToken.id));

    return { success: true };
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
