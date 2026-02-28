import { resendVerificationEmail } from "../services/auth.service.js";

export async function resend(req, res, next) {
  try {
    const { email } = req.body;
    const result = await resendVerificationEmail(email);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}
