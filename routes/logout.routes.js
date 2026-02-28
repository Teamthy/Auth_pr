import { Router } from "express";
import { logoutController } from "../controllers/logout.controller.js";
import { authenticate } from "../middlewares/authenticate.js"; // middleware to check JWT

const router = Router();
router.post("/logout", authenticate, logoutController);

export default router;
