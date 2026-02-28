// server/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tokenRoutes from "./routes/token.routes.js";
import cookieParser from "cookie-parser";
import verifyRoutes from "./routes/verify.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", tokenRoutes);
app.use("/api", verifyRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

export default app;
