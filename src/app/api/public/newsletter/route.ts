import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { NewsletterSubscriber } from "@/shared/lib/models/NewsletterSubscriber";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as { email?: string; source?: string };
    const email = body.email?.trim().toLowerCase();
    const source = (body.source ?? "other") as "footer" | "blog" | "other";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You are already subscribed!",
      });
    }

    await NewsletterSubscriber.create({ email, source });

    return NextResponse.json({
      success: true,
      message: "You're subscribed! Welcome to the DevVelocity newsletter.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
