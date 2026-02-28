// server/routes/auth.js
import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, schema } from "../config/db.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth.middleware.js";




const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      // check existing
      const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
      if (existing.length > 0) return res.status(409).json({ message: "Email already in use" });

      // hash
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // insert
      const [inserted] = await db
        .insert(schema.users)
        .values({
          email,
          passwordHash,
          role: "user",
          isVerified: false,
        })
        .returning();

      // sign token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) return res.status(500).json({ message: "Server misconfigured" });

      const token = jwt.sign(
        { sub: inserted.id, email: inserted.email, role: inserted.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      return res.status(201).json({
        user: {
          id: inserted.id,
          email: inserted.email,
          role: inserted.role,
          isVerified: inserted.isVerified,
          createdAt: inserted.createdAt,
        },
        token,
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) return res.status(500).json({ message: "Server misconfigured" });

      const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/profile", authenticate, async (req, res) => {
  const user = await db.select().from(users).where(eq(users.id, req.user.sub));
  res.json(user);
});


export default router;
