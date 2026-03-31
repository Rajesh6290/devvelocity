import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/shared/lib/models/User";
import { Organization } from "@/shared/lib/models/Organization";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const handle = searchParams.get("handle")?.trim().toLowerCase();
  const type = searchParams.get("type"); // "username" | "orgname"

  if (!handle || !type) {
    return NextResponse.json(
      { success: false, message: "handle and type are required" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_]{3,30}$/.test(handle)) {
    return NextResponse.json({ success: true, available: false, message: "Invalid format" });
  }

  await connectDB();

  let taken = false;
  if (type === "username") {
    taken = !!(await User.exists({ username: handle }));
  } else if (type === "orgname") {
    taken = !!(await Organization.exists({ orgname: handle }));
  } else {
    return NextResponse.json({ success: false, message: "type must be username or orgname" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    available: !taken,
    message: taken ? "Already taken" : "Available",
  });
}
