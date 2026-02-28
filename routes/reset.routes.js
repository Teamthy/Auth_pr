import { Router } from "express";
import { requestPasswordReset, resetPassword } from "../services/auth.service.js";

const router = Router();

router.post("/request-reset", async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/reset/:token", async (req, res, next) => {
  try {
    const result = await resetPassword(req.params.token, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
