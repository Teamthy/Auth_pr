// server/services/token.service.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { refreshTokens } from "../config/refreshTokenSchema.js";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS) || 7;

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
