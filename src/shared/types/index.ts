export type UserRole =
  | "individual"
  | "organization_student"
  | "organization_admin"
  | "super_admin";

export type PlanType = "trial" | "plus" | "pro" | "unlimited" | "organization";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "trial";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  subscriptionStartedAt: string | null;
  subscriptionEndsAt: string | null;
  organizationId: string | null;
  avatar: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  maxStudents?: number;
  isPopular?: boolean;
  trialDays: number;
  description: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  adminId: string;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  studentCount: number;
  maxStudents: number;
  subscriptionEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface JobReadinessScore {
  resumeScore: number;
  skillScore: number;
  assessmentScore: number;
  interviewScore: number;
  overallScore: number;
}
