import { logout } from "../services/auth.service.js";

export async function logoutController(req, res, next) {
  try {
    const userId = req.user.id; // comes from JWT middleware
    const result = await logout(userId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}
