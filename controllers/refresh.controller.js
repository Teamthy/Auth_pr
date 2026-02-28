import { refreshAccessToken } from "../services/token.service.js";

export async function refreshController(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}
