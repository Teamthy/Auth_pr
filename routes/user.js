// server/routes/user.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/profile", requireAuth, userController.profile);

export default router;
