import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/shared/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_token", req.url)
      );
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_or_expired_token", req.url)
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return NextResponse.redirect(new URL("/dashboard?verified=1", req.url));
  } catch {
    return NextResponse.redirect(
      new URL("/auth/login?error=verification_failed", req.url)
    );
  }
}
