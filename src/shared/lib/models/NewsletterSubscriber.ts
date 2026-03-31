import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
  source: "footer" | "blog" | "other";
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ["footer", "blog", "other"],
      default: "other",
    },
  },
  { timestamps: false }
);

export const NewsletterSubscriber =
  mongoose.models["NewsletterSubscriber"] ??
  mongoose.model<INewsletterSubscriber>(
    "NewsletterSubscriber",
    NewsletterSubscriberSchema
  );
