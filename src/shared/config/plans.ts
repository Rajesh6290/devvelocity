import type { PlanType } from "@/shared/types";

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: "INR";
  trialDays: number;
  isPopular: boolean;
  maxResumes: number | "unlimited";
  maxAssessments: number | "unlimited";
  maxInterviews: number | "unlimited";
  maxStudents: number | null; // null = N/A for individual plans
  features: string[];
  notIncluded: string[];
}

export const PLANS: Record<PlanType, PlanConfig> = {
  trial: {
    id: "trial",
    name: "Trial",
    tagline: "Try everything free for 15 days",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "INR",
    trialDays: 15,
    isPopular: false,
    maxResumes: 1,
    maxAssessments: 3,
    maxInterviews: 2,
    maxStudents: null,
    features: [
      "1 Resume analysis",
      "Skill gap analysis",
      "3 Assessments",
      "2 AI interview simulations",
      "Job readiness score",
      "Basic learning practice",
    ],
    notIncluded: [
      "Unlimited resume uploads",
      "Priority support",
      "Advanced analytics",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    tagline: "Perfect for serious job seekers",
    priceMonthly: 299,
    priceYearly: 2499,
    currency: "INR",
    trialDays: 0,
    isPopular: false,
    maxResumes: 5,
    maxAssessments: 20,
    maxInterviews: 10,
    maxStudents: null,
    features: [
      "5 Resume analyses per month",
      "Unlimited skill gap analysis",
      "20 Assessments per month",
      "10 AI interview simulations",
      "Job readiness score",
      "Personalized learning path",
      "Job recommendations",
      "Email support",
    ],
    notIncluded: [
      "Unlimited everything",
      "Priority support",
      "Advanced analytics dashboard",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "For power users ready to land their job",
    priceMonthly: 599,
    priceYearly: 4999,
    currency: "INR",
    trialDays: 0,
    isPopular: true,
    maxResumes: "unlimited",
    maxAssessments: "unlimited",
    maxInterviews: 50,
    maxStudents: null,
    features: [
      "Unlimited resume analyses",
      "Unlimited skill gap analysis",
      "Unlimited assessments",
      "50 AI interview simulations/month",
      "Advanced job readiness dashboard",
      "Personalized AI learning path",
      "Priority job recommendations",
      "Progress streak tracking",
      "Priority email support",
    ],
    notIncluded: ["Unlimited interview simulations", "Phone support"],
  },
  unlimited: {
    id: "unlimited",
    name: "Unlimited",
    tagline: "Zero limits. Maximum preparation.",
    priceMonthly: 999,
    priceYearly: 7999,
    currency: "INR",
    trialDays: 0,
    isPopular: false,
    maxResumes: "unlimited",
    maxAssessments: "unlimited",
    maxInterviews: "unlimited",
    maxStudents: null,
    features: [
      "Everything in Pro",
      "Unlimited AI interview simulations",
      "Advanced analytics & insights",
      "Dedicated career roadmap",
      "Resume keyword optimizer",
      "LinkedIn profile tips",
      "Phone + priority email support",
    ],
    notIncluded: [],
  },
  organization: {
    id: "organization",
    name: "Organization",
    tagline: "For colleges & institutes scaling placement",
    priceMonthly: 4999,
    priceYearly: 39999,
    currency: "INR",
    trialDays: 15,
    isPopular: false,
    maxResumes: "unlimited",
    maxAssessments: "unlimited",
    maxInterviews: "unlimited",
    maxStudents: 200,
    features: [
      "Up to 200 students",
      "Unlimited access for all students",
      "Organization analytics dashboard",
      "Student performance tracking",
      "Bulk student invites",
      "Custom branding (logo)",
      "Placement readiness reports",
      "Dedicated account manager",
      "Priority support",
    ],
    notIncluded: [],
  },
};

export const INDIVIDUAL_PLANS: PlanType[] = [
  "trial",
  "plus",
  "pro",
  "unlimited",
];
export const ORG_PLANS: PlanType[] = ["trial", "organization"];

// Feature access gates
export const PLAN_LIMITS = {
  canUploadResume: (plan: PlanType, count: number): boolean => {
    const cfg = PLANS[plan];
    if (cfg.maxResumes === "unlimited") return true;
    return count < cfg.maxResumes;
  },
  canTakeAssessment: (plan: PlanType, count: number): boolean => {
    const cfg = PLANS[plan];
    if (cfg.maxAssessments === "unlimited") return true;
    return count < cfg.maxAssessments;
  },
  canDoInterview: (plan: PlanType, count: number): boolean => {
    const cfg = PLANS[plan];
    if (cfg.maxInterviews === "unlimited") return true;
    return count < cfg.maxInterviews;
  },
};
