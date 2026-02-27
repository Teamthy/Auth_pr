// server/controllers/user.controller.js
export async function profile(req, res, next) {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}
