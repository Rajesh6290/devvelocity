import type { Metadata } from "next";
import dynamic from "next/dynamic";
import FaqSection from "@/features/landing/components/FaqSection";

const PricingSection = dynamic(
  () => import("@/features/pricing/components/PricingSection")
);

export const metadata: Metadata = {
  title: "Pricing – DevVelocity",
  description:
    "Transparent pricing for individual students and organizations. Start free for 15 days. No credit card required.",
};

export default function PricingPage() {
  return (
    <>
      <PricingSection />
      <FaqSection />
    </>
  );
}
