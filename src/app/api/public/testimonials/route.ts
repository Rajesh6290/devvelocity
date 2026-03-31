import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Feedback } from "@/shared/lib/models/Feedback";

export const revalidate = 3600; // re-fetch from DB every hour

export async function GET() {
  try {
    await connectDB();

    const testimonials = await Feedback.find(
      { approved: true, rating: { $gte: 3 } },
      { _id: 0, email: 0, __v: 0 } // never expose email publicly
    )
      .sort({ rating: -1, createdAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({ success: true, data: testimonials });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
