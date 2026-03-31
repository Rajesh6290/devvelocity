import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/shared/lib/models/User";
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/shared/lib/auth";
import {
  sendWelcomeEmail,
  sendTrialStartedEmail,
  sendEmailVerificationEmail,
} from "@/shared/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const { name, email, password, role: requestedRole } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Set trial dates
    const trialStartedAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 15);

    // Email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Only allow individual or organization_admin on public registration
    const allowedRoles = ["individual", "organization_admin"];
    const role =
      requestedRole && allowedRoles.includes(requestedRole)
        ? (requestedRole as "individual" | "organization_admin")
        : "individual";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      planType: "trial",
      subscriptionStatus: "trial",
      trialStartedAt,
      trialEndsAt,
      emailVerificationToken,
      emailVerificationExpires,
    });

    const username = user.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      planType: user.planType,
      subscriptionStatus: user.subscriptionStatus,
      username,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    // Send emails (non-blocking)
    const verifyLink = `${process.env["NEXT_PUBLIC_APP_URL"] ?? "https://devvelocity.in"}/auth/verify-email?token=${emailVerificationToken}`;
    Promise.all([
      sendWelcomeEmail(user.name, user.email),
      sendTrialStartedEmail(user.name, user.email, trialEndsAt.toDateString()),
      sendEmailVerificationEmail(user.name, user.email, verifyLink),
    ]).catch(() => undefined);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            planType: user.planType,
            subscriptionStatus: user.subscriptionStatus,
            trialEndsAt: user.trialEndsAt,
            username,
          },
          accessToken,
        },
      },
      { status: 201 }
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch {
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
