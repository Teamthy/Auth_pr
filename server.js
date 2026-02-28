// server/server.js
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("JWT_SECRET present:", !!process.env.JWT_SECRET);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
