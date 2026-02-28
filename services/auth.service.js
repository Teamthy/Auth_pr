import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { users } from "../config/usersSchema.js";
import { eq } from "drizzle-orm";
import { issueTokens } from "./token.service.js";
import { sendEmail } from "../config/sendgrid.js";
import { refreshTokens } from "../config/refreshTokenSchema.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// REGISTER
export async function register({ email, password }) {
  const normalized = email.trim().toLowerCase();

  const existing = await db.select().from(users).where(eq(users.email, normalized));
  if (existing.length > 0) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [inserted] = await db
    .insert(users)
    .values({
      email: normalized,
      passwordHash,
      role: "user",
      isVerified: false,
    })
    .returning();

  const { accessToken, refreshToken } = await issueTokens(inserted);

  // Save refresh token in DB
  await db.insert(refreshTokens).values({
    userId: inserted.id,
    token: refreshToken,
  });

  await sendEmail({
    to: inserted.email,
    subject: "Verify your account",
    text: `Click the link to verify: ${process.env.APP_URL}/api/verify/${inserted.id}`,
    html: `<p>Click <a href="${process.env.APP_URL}/api/verify/${inserted.id}">here</a> to verify your account.</p>`,
  });

  return { user: inserted, accessToken, refreshToken };
}

// LOGIN
export async function login({ email, password }) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalized));
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  // Save refresh token in DB
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
  });

  return { user, accessToken, refreshToken };
}

// RESEND VERIFICATION
export async function resendVerificationEmail(email) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalized));

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (user.isVerified) {
    const err = new Error("User already verified");
    err.status = 400;
    throw err;
  }

  await sendEmail({
    to: user.email,
    subject: "Verify your account",
    text: `Click the link to verify: ${process.env.APP_URL}/api/verify/${user.id}`,
    html: `<p>Click <a href="${process.env.APP_URL}/api/verify/${user.id}">here</a> to verify your account.</p>`,
  });

  return { message: "Verification email resent" };
}

// LOGOUT
export async function logout(userId) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  return { message: "Logged out successfully" };
}
