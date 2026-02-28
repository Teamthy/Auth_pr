import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // e.g. "smtp.sendgrid.net"
  port: process.env.SMTP_PORT || 587,
  secure: false,                    // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,    // e.g. "apikey" for SendGrid
    pass: process.env.SMTP_PASS,    // your API key or password
  },
});
