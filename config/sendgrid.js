import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text, html }) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // must be a verified sender in SendGrid
    subject,
    text,
    html,
  };

  const response = await sgMail.send(msg);
  console.log("Email sent:", response[0].statusCode);
  return response;
}
