import { transporter } from "../config/email.js";

export async function sendEmail({ to, subject, text, html }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM, // e.g. "no-reply@yourapp.com"
    to,
    subject,
    text,
    html,
  });
  console.log("Email sent:", info.messageId);
  return info;
}
