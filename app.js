// server/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tokenRoutes from "./routes/token.routes.js";
import cookieParser from "cookie-parser";
import verifyRoutes from "./routes/verify.routes.js";
import resendRoutes from "./routes/resend.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", tokenRoutes);
app.use("/api", verifyRoutes);
app.use("/api/auth", resendRoutes);


// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

export default app;
