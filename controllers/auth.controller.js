// server/controllers/auth.controller.js
import { validationResult } from "express-validator";
import * as authService from "../services/auth.service.js";
import { revokeRefreshToken } from "../services/token.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  // set a long maxAge to match your refresh token lifetime (ms)
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const result = await authService.register({ email, password });

    // set refresh token cookie and return access token + user
    if (result.refreshToken) {
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
    }

    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    if (result.refreshToken) {
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
    }

    return res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // prefer cookie, fallback to body
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
