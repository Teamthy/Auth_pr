import { Router } from "express";
import { verify } from "../controllers/verify.controller.js";

const router = Router();
router.get("/verify/:id", verify);

export default router;
