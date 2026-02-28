// server/test-db.js
import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const { rows } = await pool.query("SELECT 1 as ok");
    console.log("DB test OK:", rows);
  } catch (e) {
    console.error("DB test failed:", e);
  } finally {
    await pool.end();
  }
})();
