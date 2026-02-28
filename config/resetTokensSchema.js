import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./usersSchema.js";

export const resetTokens = pgTable("reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
