import { NextResponse } from "next/server";
import { PLANS, INDIVIDUAL_PLANS, ORG_PLANS } from "@/shared/config/plans";

export async function GET() {
  const individual = INDIVIDUAL_PLANS.map((id) => PLANS[id]);
  const organization = ORG_PLANS.filter((id) => id !== "trial").map(
    (id) => PLANS[id]
  );

  return NextResponse.json({
    success: true,
    data: { individual, organization },
  });
}
