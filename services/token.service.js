// server/services/token.service.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { refreshTokens } from "../config/refreshTokenSchema.js";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS) || 7;

// Issue access + refresh tokens
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

// Refresh access token with rotation
export async function refreshAccessToken(oldRefreshToken) {
  // Look up token in DB
  const [stored] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, oldRefreshToken));
  if (!stored) {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }

  // Check expiry
  if (new Date() > stored.expiresAt) {
    const err = new Error("Expired refresh token");
    err.status = 403;
    throw err;
  }

  // Delete old refresh token (rotation)
  await db.delete(refreshTokens).where(eq(refreshTokens.token, oldRefreshToken));

  // Issue new tokens
  const accessToken = jwt.sign(
    { sub: stored.userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const newRefreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId: stored.userId,
    token: newRefreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken: newRefreshToken };
}
