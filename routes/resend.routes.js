import { Router } from "express";
import { resend } from "../controllers/resend.controller.js";

const router = Router();
router.post("/resend-verification", resend);

export default router;
