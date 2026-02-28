import { db } from "../config/db.js";
import { users } from "../config/usersSchema.js";
import { eq } from "drizzle-orm";

export async function verify(req, res, next) {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      return res.status(404).send("User not found");
    }

    return res.send("Account verified successfully!");
  } catch (err) {
    next(err);
  }
}
