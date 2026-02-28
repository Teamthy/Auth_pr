import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./usersSchema.js";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),   // store JWT string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
