import nodemailer from "nodemailer";
import HttpError from "./httpError.js";

let transporter;

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.APP_URL) {
    throw new HttpError(503, "Password reset email is not configured");
  }
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
};

export const sendPasswordResetEmail = (to, resetUrl) =>
  getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your ICHgram password",
    text: `Open this link to choose a new password. It expires in one hour.\n\n${resetUrl}`,
  });
