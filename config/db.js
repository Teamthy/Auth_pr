// server/config/db.js
import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

const pool = new Pool({
  host: process.env.DB_HOST || undefined,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || undefined,
  // fallback to connectionString if you prefer
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                    // max clients in pool (tune for dev)
  idleTimeoutMillis: 30000,   // close idle clients after 30s
  connectionTimeoutMillis: 20000, // 20s connect timeout
  allowExitOnIdle: false,
});

pool.on("error", (err) => {
  console.error("PG Pool error:", err);
});

pool.on("connect", (client) => {
  console.log("PG Pool connected a client");
});

pool.on("acquire", () => {
  // optional: log when a client is checked out
});

export const db = drizzle(pool);
export { schema, pool };
