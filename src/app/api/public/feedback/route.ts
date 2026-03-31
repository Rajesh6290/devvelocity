import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Feedback } from "@/shared/lib/models/Feedback";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as {
      name?: string;
      role?: string;
      email?: string;
      rating?: number;
      text?: string;
    };

    const { name, role, email, rating, text } = body;

    if (!name?.trim() || !role?.trim() || !email?.trim() || !text?.trim() || !rating) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    if (text.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: "Feedback must be at least 20 characters." },
        { status: 400 }
      );
    }

    await Feedback.create({
      name: name.trim(),
      role: role.trim(),
      email: email.trim().toLowerCase(),
      rating,
      text: text.trim(),
      approved: false, // requires admin approval before showing on site
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback! It will appear after review.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Submission failed. Please try again." },
      { status: 500 }
    );
  }
}
