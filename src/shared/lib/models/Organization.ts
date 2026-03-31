import mongoose, { Schema, Document, Model } from "mongoose";
import type { PlanType, SubscriptionStatus } from "./User";

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  gstNumber: string | null;

  adminId: mongoose.Types.ObjectId;

  // Plan / subscription
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  maxStudents: number;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  subscriptionStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
  billingCycle: "monthly" | "yearly" | null;
  currentOrderId: string | null;

  // Payment history (org-level)
  paymentHistory: mongoose.Types.DocumentArray<
    mongoose.Types.Subdocument & {
      orderId: string;
      paymentId: string | undefined;
      gateway: string;
      amount: number;
      currency: string;
      planType: PlanType;
      billingCycle: string;
      status: string;
      invoiceUrl: string | undefined;
      paidAt: Date | undefined;
      createdAt: Date;
    }
  >;

  // Aggregate analytics (computed by cron or real-time)
  analytics: {
    totalStudents: number;
    activeStudents: number;
    avgResumeScore: number;
    avgSkillScore: number;
    avgAssessmentScore: number;
    avgInterviewScore: number;
    avgJobReadinessScore: number;
    topPerformers: mongoose.Types.ObjectId[];
    lastComputedAt: Date | null;
  };

  // Email notification preferences
  notifyTrialExpiry: boolean;
  notifySubscriptionExpiry: boolean;
  notifyStudentReports: boolean;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrgPaymentSchema = new Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String },
  gateway: {
    type: String,
    enum: ["razorpay", "stripe", "manual"],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  planType: {
    type: String,
    enum: ["trial", "plus", "pro", "unlimited", "organization"],
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "monthly",
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "refunded"],
    default: "pending",
  },
  invoiceUrl: { type: String },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const OrgAnalyticsSchema = new Schema({
  totalStudents: { type: Number, default: 0 },
  activeStudents: { type: Number, default: 0 },
  avgResumeScore: { type: Number, default: 0 },
  avgSkillScore: { type: Number, default: 0 },
  avgAssessmentScore: { type: Number, default: 0 },
  avgInterviewScore: { type: Number, default: 0 },
  avgJobReadinessScore: { type: Number, default: 0 },
  topPerformers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastComputedAt: { type: Date, default: null },
});

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: null },
    website: { type: String, default: null },
    logoUrl: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: "India" },
    gstNumber: { type: String, default: null },

    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    planType: {
      type: String,
      enum: ["trial", "plus", "pro", "unlimited", "organization"],
      default: "trial",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "cancelled", "trial"],
      default: "trial",
    },
    maxStudents: { type: Number, default: 50 },
    trialStartedAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
    subscriptionStartedAt: { type: Date, default: null },
    subscriptionEndsAt: { type: Date, default: null },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: null },
    currentOrderId: { type: String, default: null },

    paymentHistory: { type: [OrgPaymentSchema], default: [] },
    analytics: { type: OrgAnalyticsSchema, default: () => ({}) },

    notifyTrialExpiry: { type: Boolean, default: true },
    notifySubscriptionExpiry: { type: Boolean, default: true },
    notifyStudentReports: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

OrganizationSchema.index({ adminId: 1 });
OrganizationSchema.index({ planType: 1, subscriptionStatus: 1 });
OrganizationSchema.index({ trialEndsAt: 1 });
OrganizationSchema.index({ subscriptionEndsAt: 1 });

export const Organization: Model<IOrganization> =
  mongoose.models["Organization"] ??
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
