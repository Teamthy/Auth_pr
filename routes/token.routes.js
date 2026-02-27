// server/routes/token.routes.js
import { Router } from "express";
import * as tokenController from "../controllers/token.controller.js";

const router = Router();

router.post("/refresh", tokenController.refresh);
router.post("/logout", tokenController.logout);

export default router;
