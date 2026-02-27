// server/services/auth.service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, schema } from "../config/db.js";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function register({ email, password }) {
  const normalized = email.trim().toLowerCase();

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, normalized));
  if (existing.length > 0) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [inserted] = await db
    .insert(schema.users)
    .values({ email: normalized, passwordHash, role: "user", isVerified: false })
    .returning();

  const token = jwt.sign({ sub: inserted.id, email: inserted.email, role: inserted.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    user: {
      id: inserted.id,
      email: inserted.email,
      role: inserted.role,
      isVerified: inserted.isVerified,
      createdAt: inserted.createdAt,
    },
    token,
  };
}

export async function login({ email, password }) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, normalized));
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

  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
    token,
  };
}
