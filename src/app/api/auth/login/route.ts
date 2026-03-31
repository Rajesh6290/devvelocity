import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/shared/lib/models/User";
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/shared/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json()) as {
      email?: string;
      password?: string;
    };

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update login analytics
    await User.findByIdAndUpdate(user._id, {
      $inc: { "analytics.loginCount": 1 },
      $set: { "analytics.lastActiveAt": new Date() },
    });

    // Check trial expiry and update if expired
    if (
      user.subscriptionStatus === "trial" &&
      user.trialEndsAt &&
      new Date() > user.trialEndsAt
    ) {
      user.subscriptionStatus = "expired";
      await user.save();
    }

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
      organizationId: user.organizationId?.toString(),
      username,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          planType: user.planType,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
          subscriptionEndsAt: user.subscriptionEndsAt,
          organizationId: user.organizationId,
          avatar: user.avatar,
        },
        accessToken,
      },
    });

    return setAuthCookies(response, accessToken, refreshToken);
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
