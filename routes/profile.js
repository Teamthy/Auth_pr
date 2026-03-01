import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { db } from "../config/db.js";
import { users } from "../config/usersSchema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.sub));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: user.id, email: user.email, role: user.role, isVerified: user.isVerified });
  } catch (err) {
    next(err);
  }
});

export default router;
