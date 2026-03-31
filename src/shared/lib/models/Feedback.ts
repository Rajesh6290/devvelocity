import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  role: string;
  email: string;
  rating: number; // 1–5
  text: string;
  approved: boolean;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FeedbackSchema.index({ approved: 1, rating: -1 });

export const Feedback =
  mongoose.models["Feedback"] ??
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
