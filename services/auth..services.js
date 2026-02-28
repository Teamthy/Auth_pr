// server/services/auth.service.js
import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { users } from "../config/usersSchema.js";
import { eq } from "drizzle-orm";
import { issueTokens } from "./token.service.js";
import { sendEmail } from "../config/sendgrid.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// REGISTER
export async function register({ email, password }) {
  const normalized = email.trim().toLowerCase();

  // check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, normalized));
  if (existing.length > 0) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // insert new user
  const [inserted] = await db
    .insert(users)
    .values({
      email: normalized,
      passwordHash,
      role: "user",
      isVerified: false,
    })
    .returning();

  // issue tokens
  const { accessToken, refreshToken } = await issueTokens(inserted);

  // send verification email
  await sendEmail({
    to: inserted.email,
    subject: "Verify your account",
    text: `Click the link to verify: ${process.env.APP_URL}/verify/${inserted.id}`,
    html: `<p>Click <a href="${process.env.APP_URL}/verify/${inserted.id}">here</a> to verify your account.</p>`,
  });

  return {
    user: {
      id: inserted.id,
      email: inserted.email,
      role: inserted.role,
      isVerified: inserted.isVerified,
      createdAt: inserted.createdAt,
    },
    accessToken,
    refreshToken,
  };
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

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}
