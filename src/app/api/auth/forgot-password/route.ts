import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/shared/lib/models/User";
import { sendPasswordResetEmail } from "@/shared/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json()) as { email?: string };
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const resetLink = `${process.env["NEXT_PUBLIC_APP_URL"] ?? "https://devvelocity.in"}/auth/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.name, user.email, resetLink);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a reset link shortly.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Request failed. Please try again." },
      { status: 500 }
    );
  }
}
