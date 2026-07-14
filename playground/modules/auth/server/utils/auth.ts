import type { FastifyReply } from "fastify";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

export function getRefreshTokenExpiration(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

export function setTokensCookie(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
) {
  reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearRefreshTokenCookie(reply: FastifyReply) {
  reply.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
  reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
}
