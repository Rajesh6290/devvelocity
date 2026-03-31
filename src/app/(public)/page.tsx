import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/features/landing/components/HeroSection";

const StatsSection = dynamic(
  () => import("@/features/landing/components/StatsSection")
);
const FeaturesSection = dynamic(
  () => import("@/features/landing/components/FeaturesSection")
);
const HowItWorksSection = dynamic(
  () => import("@/features/landing/components/HowItWorksSection")
);
const FaqSection = dynamic(
  () => import("@/features/landing/components/FaqSection")
);
const CtaSection = dynamic(
  () => import("@/features/landing/components/CtaSection")
);

export const metadata: Metadata = {
  title:
    "DevVelocity – AI Career Copilot for Resume, Skill Gap & Job Readiness",
  description:
    "DevVelocity is an AI-powered career platform that helps students improve resumes, identify skill gaps, practice assessments, and become job-ready with personalized guidance.",
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
