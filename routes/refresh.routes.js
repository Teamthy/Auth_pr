import { Router } from "express";
import { refreshController } from "../controllers/refresh.controller.js";

const router = Router();
router.post("/refresh", refreshController);

export default router;
