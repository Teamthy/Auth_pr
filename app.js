// server/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tokenRoutes from "./routes/token.routes.js";
import cookieParser from "cookie-parser";
import verifyRoutes from "./routes/verify.routes.js";
import resendRoutes from "./routes/resend.routes.js";
import logoutRoutes from "./routes/logout.routes.js";
import refreshRoutes from "./routes/refresh.routes.js";
import resetRoutes from "./routes/reset.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import profileRoutes from "./routes/profile.js";




const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", tokenRoutes);
app.use("/api", verifyRoutes);
app.use("/api/auth", resendRoutes);
app.use("/api/auth", logoutRoutes);
app.use("/api/auth", refreshRoutes);
app.use("/api/auth", resetRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

export default app;
