// server/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tokenRoutes from "./routes/token.routes.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/auth", tokenRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use(cookieParser());


export default app;
