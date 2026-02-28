// server/controllers/token.controller.js
import * as tokenService from "../services/token.service.js";

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await tokenService.refreshAccessToken(refreshToken);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await tokenService.revokeRefreshToken(refreshToken);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
