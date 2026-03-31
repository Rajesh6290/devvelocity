// Required environment variables:
// EMAIL_HOST         — SMTP host (e.g. smtp.gmail.com)
// EMAIL_PORT         — SMTP port (e.g. 587)
// EMAIL_USER         — SMTP username / email address
// EMAIL_PASS         — SMTP password / app password
// EMAIL_FROM         — "From" display name + address (e.g. "DevVelocity <no-reply@devvelocity.in>")

import nodemailer from "nodemailer";
import { logger } from "./logger";
import {
  buildEmailVerificationEmail,
  buildOrganizationWelcomeEmail,
  buildPasswordResetEmail,
  buildStudentInviteEmail,
  buildSubscriptionConfirmedEmail,
  buildSubscriptionExpiredEmail,
  buildSubscriptionExpiringEmail,
  buildTrialExpiredEmail,
  buildTrialExpiringEmail,
  buildTrialStartedEmail,
  buildWeeklyReportEmail,
  buildWelcomeEmail,
} from "./emailTemplates";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env["EMAIL_HOST"],
    port: Number(process.env["EMAIL_PORT"] ?? 587),
    secure: Number(process.env["EMAIL_PORT"]) === 465,
    auth: {
      user: process.env["EMAIL_USER"],
      pass: process.env["EMAIL_PASS"],
    },
  });
}

/**
 * Call once at app startup (e.g. in a server init file or first API route)
 * to verify SMTP credentials are configured correctly.
 */
export async function verifyEmailConnection(): Promise<void> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info("EMAIL", "✓ SMTP connection verified", {
      host: process.env["EMAIL_HOST"],
      port: process.env["EMAIL_PORT"],
      user: process.env["EMAIL_USER"],
    });
  } catch (err) {
    logger.error(
      "EMAIL",
      "✗ SMTP connection failed — emails will not be sent",
      err
    );
  }
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const to = Array.isArray(options.to) ? options.to.join(", ") : options.to;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:
        process.env["EMAIL_FROM"] ?? "DevVelocity <no-reply@devvelocity.in>",
      to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info("EMAIL", `✓ Email sent`, { to, subject: options.subject });
    return true;
  } catch (err) {
    logger.error("EMAIL", `✗ Email failed`, {
      to,
      subject: options.subject,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ── Specific email senders ────────────────────────────────────────────────────

export async function sendWelcomeEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to DevVelocity 🎉",
    html: buildWelcomeEmail(name),
  });
}

export async function sendTrialStartedEmail(
  name: string,
  email: string,
  trialEndsAt: string
) {
  return sendEmail({
    to: email,
    subject: "Your 15-Day Free Trial Has Started – DevVelocity",
    html: buildTrialStartedEmail(name, trialEndsAt),
  });
}

export async function sendTrialExpiringEmail(
  name: string,
  email: string,
  daysLeft: number
) {
  return sendEmail({
    to: email,
    subject: `Your Trial Expires in ${daysLeft} Day${daysLeft > 1 ? "s" : ""} – Upgrade Now`,
    html: buildTrialExpiringEmail(name, daysLeft),
  });
}

export async function sendTrialExpiredEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: "Your Free Trial Has Ended – Continue Your Journey",
    html: buildTrialExpiredEmail(name),
  });
}

export async function sendSubscriptionConfirmedEmail(
  name: string,
  email: string,
  planName: string,
  expiresAt: string
) {
  return sendEmail({
    to: email,
    subject: `Subscription Confirmed – ${planName} Plan`,
    html: buildSubscriptionConfirmedEmail(name, planName, expiresAt),
  });
}

export async function sendSubscriptionExpiringEmail(
  name: string,
  email: string,
  planName: string,
  daysLeft: number
) {
  return sendEmail({
    to: email,
    subject: `Your ${planName} Plan Expires in ${daysLeft} Days`,
    html: buildSubscriptionExpiringEmail(name, planName, daysLeft),
  });
}

export async function sendSubscriptionExpiredEmail(
  name: string,
  email: string,
  planName: string
) {
  return sendEmail({
    to: email,
    subject: "Your Subscription Has Expired – Renew to Keep Access",
    html: buildSubscriptionExpiredEmail(name, planName),
  });
}

export async function sendPasswordResetEmail(
  name: string,
  email: string,
  resetLink: string
) {
  return sendEmail({
    to: email,
    subject: "Reset Your DevVelocity Password",
    html: buildPasswordResetEmail(name, resetLink),
  });
}

export async function sendOrganizationWelcomeEmail(
  adminName: string,
  email: string,
  orgName: string
) {
  return sendEmail({
    to: email,
    subject: `Welcome to DevVelocity – ${orgName} Account Created`,
    html: buildOrganizationWelcomeEmail(adminName, orgName),
  });
}

export async function sendStudentInviteEmail(
  studentName: string,
  email: string,
  orgName: string,
  inviteLink: string
) {
  return sendEmail({
    to: email,
    subject: `You've Been Invited to Join ${orgName} on DevVelocity`,
    html: buildStudentInviteEmail(studentName, orgName, inviteLink),
  });
}

export async function sendEmailVerificationEmail(
  name: string,
  email: string,
  verifyLink: string
) {
  return sendEmail({
    to: email,
    subject: "Verify Your Email – DevVelocity",
    html: buildEmailVerificationEmail(name, verifyLink),
  });
}

export async function sendWeeklyReportEmail(
  name: string,
  email: string,
  stats: {
    jobReadinessScore: number;
    assessmentAvgScore: number;
    interviewAvgScore: number;
    practiceSessionsCompleted: number;
  }
) {
  return sendEmail({
    to: email,
    subject: "Your Weekly Progress Report – DevVelocity",
    html: buildWeeklyReportEmail(name, stats),
  });
}
