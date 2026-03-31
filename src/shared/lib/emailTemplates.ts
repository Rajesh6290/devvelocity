const APP_URL = "https://devvelocity.in";
const SUPPORT_EMAIL = "support@devvelocity.in";
const LOGO_URL = `${APP_URL}/logo.svg`;

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DevVelocity</title>
  <style>
    body { margin:0; padding:0; background:#f8fafc; font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); }
    .header { background:#6160b0; padding:28px 32px; text-align:center; }
    .header img { height:40px; filter:brightness(0) invert(1); }
    .body { padding:32px; }
    .body h2 { font-size:22px; font-weight:700; margin:0 0 12px; color:#1e293b; }
    .body p { font-size:15px; line-height:1.7; color:#475569; margin:0 0 16px; }
    .btn { display:inline-block; background:#6160b0; color:#ffffff!important; text-decoration:none; padding:13px 28px; border-radius:8px; font-size:15px; font-weight:600; margin:8px 0 16px; }
    .badge { display:inline-block; background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:20px; font-size:13px; font-weight:600; margin-bottom:16px; }
    .badge-warn { background:#fef3c7; color:#92400e; }
    .badge-danger { background:#fee2e2; color:#991b1b; }
    .badge-success { background:#dcfce7; color:#166534; }
    .divider { height:1px; background:#e2e8f0; margin:24px 0; }
    .footer { background:#f1f5f9; padding:20px 32px; text-align:center; font-size:13px; color:#94a3b8; }
    .footer a { color:#6160b0; text-decoration:none; }
    .highlight-box { background:#f8fafc; border-left:4px solid #6160b0; padding:14px 18px; border-radius:0 8px 8px 0; margin:16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${LOGO_URL}" alt="DevVelocity" />
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} DevVelocity &nbsp;|&nbsp; <a href="${APP_URL}">devvelocity.in</a> &nbsp;|&nbsp; <a href="mailto:${SUPPORT_EMAIL}">Support</a></p>
      <p>DevVelocity, India</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Welcome ───────────────────────────────────────────────────────────────────
export function buildWelcomeEmail(name: string): string {
  return baseLayout(`
    <h2>Welcome aboard, ${name}! 🎉</h2>
    <span class="badge badge-success">Account Created</span>
    <p>We're thrilled to have you on <strong>DevVelocity</strong> — your AI-powered career copilot.</p>
    <p>Your <strong>15-day free trial</strong> is now active. Here's what you can do:</p>
    <div class="highlight-box">
      <p style="margin:0;color:#1e293b;font-size:14px;">
        ✅ &nbsp;Upload &amp; analyze your resume<br/>
        ✅ &nbsp;Identify your skill gaps<br/>
        ✅ &nbsp;Practice with AI-generated questions<br/>
        ✅ &nbsp;Simulate real interviews<br/>
        ✅ &nbsp;Track your job readiness score
      </p>
    </div>
    <a class="btn" href="${APP_URL}/dashboard">Go to Dashboard →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Need help getting started? Reply to this email or visit our <a href="${APP_URL}/contact" style="color:#6160b0;">support page</a>.</p>
  `);
}

// ── Trial Started ─────────────────────────────────────────────────────────────
export function buildTrialStartedEmail(
  name: string,
  trialEndsAt: string
): string {
  return baseLayout(`
    <h2>Your 15-Day Trial Has Started</h2>
    <span class="badge">Trial Active</span>
    <p>Hi <strong>${name}</strong>, your free trial is now live.</p>
    <div class="highlight-box">
      <p style="margin:0;color:#1e293b;font-size:14px;">
        📅 &nbsp;Trial ends: <strong>${trialEndsAt}</strong>
      </p>
    </div>
    <p>Make the most of it — explore all premium features before your trial ends.</p>
    <a class="btn" href="${APP_URL}/dashboard">Start Exploring →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Want to unlock unlimited access? <a href="${APP_URL}/pricing" style="color:#6160b0;">View our plans</a>.</p>
  `);
}

// ── Trial Expiring ────────────────────────────────────────────────────────────
export function buildTrialExpiringEmail(
  name: string,
  daysLeft: number
): string {
  return baseLayout(`
    <h2>Your Trial Expires in ${daysLeft} Day${daysLeft > 1 ? "s" : ""}</h2>
    <span class="badge badge-warn">⚠ Trial Expiring Soon</span>
    <p>Hi <strong>${name}</strong>, your DevVelocity trial is ending soon.</p>
    <p>Don't lose your progress! Upgrade now to keep access to:</p>
    <div class="highlight-box">
      <p style="margin:0;color:#1e293b;font-size:14px;">
        🚀 &nbsp;Unlimited resume analyses<br/>
        🎯 &nbsp;AI interview simulations<br/>
        📊 &nbsp;Full skill gap reports<br/>
        💼 &nbsp;Job readiness score tracking
      </p>
    </div>
    <a class="btn" href="${APP_URL}/pricing">Upgrade Now →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#6160b0;">Contact us</a>.</p>
  `);
}

// ── Trial Expired ─────────────────────────────────────────────────────────────
export function buildTrialExpiredEmail(name: string): string {
  return baseLayout(`
    <h2>Your Trial Has Ended</h2>
    <span class="badge badge-danger">Trial Expired</span>
    <p>Hi <strong>${name}</strong>, your 15-day DevVelocity trial has ended.</p>
    <p>Upgrade to a paid plan to continue your journey. Your data and progress are safely stored and waiting for you.</p>
    <a class="btn" href="${APP_URL}/pricing">Choose a Plan →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Need more information? <a href="${APP_URL}/contact" style="color:#6160b0;">Talk to us</a>.</p>
  `);
}

// ── Subscription Confirmed ─────────────────────────────────────────────────────
export function buildSubscriptionConfirmedEmail(
  name: string,
  planName: string,
  expiresAt: string
): string {
  return baseLayout(`
    <h2>Subscription Confirmed!</h2>
    <span class="badge badge-success">✓ Payment Successful</span>
    <p>Hi <strong>${name}</strong>, thank you for subscribing to DevVelocity.</p>
    <div class="highlight-box">
      <p style="margin:0;color:#1e293b;font-size:14px;">
        📦 &nbsp;Plan: <strong>${planName}</strong><br/>
        📅 &nbsp;Valid until: <strong>${expiresAt}</strong>
      </p>
    </div>
    <p>Your full access is now active. Start building your career today.</p>
    <a class="btn" href="${APP_URL}/dashboard">Open Dashboard →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Invoice will be emailed separately. For billing queries, <a href="mailto:${SUPPORT_EMAIL}" style="color:#6160b0;">contact support</a>.</p>
  `);
}

// ── Subscription Expiring ─────────────────────────────────────────────────────
export function buildSubscriptionExpiringEmail(
  name: string,
  planName: string,
  daysLeft: number
): string {
  return baseLayout(`
    <h2>Your ${planName} Plan Expires in ${daysLeft} Day${daysLeft > 1 ? "s" : ""}</h2>
    <span class="badge badge-warn">⚠ Renewal Reminder</span>
    <p>Hi <strong>${name}</strong>, your <strong>${planName}</strong> subscription is expiring soon.</p>
    <p>Renew now to avoid any interruption in your learning journey.</p>
    <a class="btn" href="${APP_URL}/pricing">Renew Subscription →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#6160b0;">Contact us</a>.</p>
  `);
}

// ── Subscription Expired ──────────────────────────────────────────────────────
export function buildSubscriptionExpiredEmail(
  name: string,
  planName: string
): string {
  return baseLayout(`
    <h2>Your Subscription Has Expired</h2>
    <span class="badge badge-danger">Subscription Expired</span>
    <p>Hi <strong>${name}</strong>, your <strong>${planName}</strong> plan has expired.</p>
    <p>Your progress and data are safe. Renew now to restore full access.</p>
    <a class="btn" href="${APP_URL}/pricing">Renew Now →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#6160b0;">Contact support</a>.</p>
  `);
}

// ── Password Reset ────────────────────────────────────────────────────────────
export function buildPasswordResetEmail(
  name: string,
  resetLink: string
): string {
  return baseLayout(`
    <h2>Reset Your Password</h2>
    <p>Hi <strong>${name}</strong>, we received a request to reset your password.</p>
    <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <a class="btn" href="${resetLink}">Reset Password →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">If you didn't request this, ignore this email. Your password will remain unchanged.</p>
    <p style="font-size:12px;color:#cbd5e1;word-break:break-all;">Link: ${resetLink}</p>
  `);
}

// ── Email Verification ────────────────────────────────────────────────────────
export function buildEmailVerificationEmail(
  name: string,
  verifyLink: string
): string {
  return baseLayout(`
    <h2>Verify Your Email Address</h2>
    <p>Hi <strong>${name}</strong>, thanks for signing up!</p>
    <p>Please verify your email address to activate your account. This link expires in <strong>24 hours</strong>.</p>
    <a class="btn" href="${verifyLink}">Verify Email →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">If you didn't create an account on DevVelocity, please ignore this email.</p>
  `);
}

// ── Organization Welcome ──────────────────────────────────────────────────────
export function buildOrganizationWelcomeEmail(
  adminName: string,
  orgName: string
): string {
  return baseLayout(`
    <h2>Welcome to DevVelocity – ${orgName}</h2>
    <span class="badge badge-success">Organization Account Created</span>
    <p>Hi <strong>${adminName}</strong>, your organization account for <strong>${orgName}</strong> is now active.</p>
    <div class="highlight-box">
      <p style="margin:0;color:#1e293b;font-size:14px;">
        👥 &nbsp;Add and manage your students<br/>
        📊 &nbsp;Track student performance &amp; readiness<br/>
        🎓 &nbsp;Access organization analytics dashboard
      </p>
    </div>
    <a class="btn" href="${APP_URL}/organization/dashboard">Open Organization Dashboard →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Need to add students? Go to <a href="${APP_URL}/organization/students" style="color:#6160b0;">Manage Students</a>.</p>
  `);
}

// ── Student Invite ────────────────────────────────────────────────────────────
export function buildStudentInviteEmail(
  studentName: string,
  orgName: string,
  inviteLink: string
): string {
  return baseLayout(`
    <h2>You're Invited to Join ${orgName} on DevVelocity</h2>
    <span class="badge">Invitation</span>
    <p>Hi <strong>${studentName}</strong>, <strong>${orgName}</strong> has invited you to their DevVelocity workspace.</p>
    <p>DevVelocity is an AI-powered platform that helps you become job-ready through resume analysis, skill gap identification, and interview practice.</p>
    <a class="btn" href="${inviteLink}">Accept Invitation →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">This invitation link expires in 7 days. If you did not expect this, ignore this email.</p>
  `);
}

// ── Weekly Progress Report ────────────────────────────────────────────────────
export function buildWeeklyReportEmail(
  name: string,
  stats: {
    jobReadinessScore: number;
    assessmentAvgScore: number;
    interviewAvgScore: number;
    practiceSessionsCompleted: number;
  }
): string {
  return baseLayout(`
    <h2>Your Weekly Progress Report</h2>
    <span class="badge">Weekly Summary</span>
    <p>Hi <strong>${name}</strong>, here's how you did this week on DevVelocity.</p>
    <div class="highlight-box">
      <p style="margin:0;color:#1e293b;font-size:14px;">
        🎯 &nbsp;Job Readiness Score: <strong>${stats.jobReadinessScore}%</strong><br/>
        📝 &nbsp;Assessment Avg Score: <strong>${stats.assessmentAvgScore}%</strong><br/>
        🎤 &nbsp;Interview Avg Score: <strong>${stats.interviewAvgScore}%</strong><br/>
        🏋️ &nbsp;Practice Sessions: <strong>${stats.practiceSessionsCompleted}</strong>
      </p>
    </div>
    <p>Keep going! Consistent practice is the key to landing your dream job.</p>
    <a class="btn" href="${APP_URL}/dashboard">View Full Report →</a>
  `);
}
