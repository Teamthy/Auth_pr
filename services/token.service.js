// server/services/token.service.js
import jwt from "jsonwebtoken";
import { db, schema } from "../config/db.js";
import { refreshTokens } from "../config/refreshTokenSchema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // short-lived access
const REFRESH_EXPIRES_DAYS = 7;

export async function issueTokens(user) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken) {
  const [stored] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error("Invalid or expired refresh token");
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { sub: stored.userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { accessToken };
}

export async function revokeRefreshToken(refreshToken) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
}
