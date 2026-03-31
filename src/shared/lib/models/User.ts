import mongoose, { Schema, Document, Model } from "mongoose";

// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "individual"
  | "organization_student"
  | "organization_admin"
  | "super_admin";

export type PlanType = "trial" | "plus" | "pro" | "unlimited" | "organization";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "trial";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type PaymentGateway = "razorpay" | "stripe" | "manual";

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const PaymentHistorySchema = new Schema({
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

const AnalyticsSchema = new Schema({
  resumeUploads: { type: Number, default: 0 },
  resumeScore: { type: Number, default: 0 },
  skillGapChecks: { type: Number, default: 0 },
  practiceSessionsCompleted: { type: Number, default: 0 },
  assessmentsTaken: { type: Number, default: 0 },
  assessmentAvgScore: { type: Number, default: 0 },
  interviewsCompleted: { type: Number, default: 0 },
  interviewAvgScore: { type: Number, default: 0 },
  jobApplicationsTracked: { type: Number, default: 0 },
  jobReadinessScore: { type: Number, default: 0 },
  lastActiveAt: { type: Date },
  loginCount: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalTimeSpentMinutes: { type: Number, default: 0 },
});

// ── Main User Schema ─────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;

  // Plan / subscription
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  subscriptionStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
  billingCycle: "monthly" | "yearly" | null;
  currentOrderId: string | null;

  // Payment history
  paymentHistory: mongoose.Types.DocumentArray<
    mongoose.Types.Subdocument & {
      orderId: string;
      paymentId: string | undefined;
      gateway: PaymentGateway;
      amount: number;
      currency: string;
      planType: PlanType;
      billingCycle: "monthly" | "yearly";
      status: PaymentStatus;
      invoiceUrl: string | undefined;
      paidAt: Date | undefined;
      createdAt: Date;
    }
  >;

  // Organization link
  organizationId: mongoose.Types.ObjectId | null;

  // Analytics
  analytics: {
    resumeUploads: number;
    resumeScore: number;
    skillGapChecks: number;
    practiceSessionsCompleted: number;
    assessmentsTaken: number;
    assessmentAvgScore: number;
    interviewsCompleted: number;
    interviewAvgScore: number;
    jobApplicationsTracked: number;
    jobReadinessScore: number;
    lastActiveAt: Date | null;
    loginCount: number;
    streakDays: number;
    longestStreak: number;
    totalTimeSpentMinutes: number;
  };

  // Profile extras
  targetRole: string | null;
  skills: string[];
  education: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
  location: string | null;

  // Email notification preferences
  notifyTrialExpiry: boolean;
  notifySubscriptionExpiry: boolean;
  notifyWeeklyReport: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "individual",
        "organization_student",
        "organization_admin",
        "super_admin",
      ],
      default: "individual",
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

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
    trialStartedAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
    subscriptionStartedAt: { type: Date, default: null },
    subscriptionEndsAt: { type: Date, default: null },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: null },
    currentOrderId: { type: String, default: null },

    paymentHistory: { type: [PaymentHistorySchema], default: [] },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    analytics: {
      type: AnalyticsSchema,
      default: () => ({}),
    },

    targetRole: { type: String, default: null },
    skills: { type: [String], default: [] },
    education: { type: String, default: null },
    linkedinUrl: { type: String, default: null },
    githubUrl: { type: String, default: null },
    portfolioUrl: { type: String, default: null },
    resumeUrl: { type: String, default: null },
    location: { type: String, default: null },

    notifyTrialExpiry: { type: Boolean, default: true },
    notifySubscriptionExpiry: { type: Boolean, default: true },
    notifyWeeklyReport: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ planType: 1, subscriptionStatus: 1 });
UserSchema.index({ trialEndsAt: 1 });
UserSchema.index({ subscriptionEndsAt: 1 });

export const User: Model<IUser> =
  mongoose.models["User"] ?? mongoose.model<IUser>("User", UserSchema);
