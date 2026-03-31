"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";

interface FeedbackValues {
  name: string;
  role: string;
  email: string;
  rating: number;
  text: string;
}

const feedbackSchema = Yup.object({
  name: Yup.string()
    .min(2, "At least 2 characters")
    .required("Name is required"),
  role: Yup.string()
    .min(3, "At least 3 characters")
    .required("Role / company is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  rating: Yup.number()
    .min(1, "Select a rating")
    .max(5)
    .required("Rating is required"),
  text: Yup.string()
    .min(20, "At least 20 characters")
    .max(1000, "Max 1000 characters")
    .required("Feedback is required"),
});

const INITIAL: FeedbackValues = {
  name: "",
  role: "",
  email: "",
  rating: 0,
  text: "",
};

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function FeedbackPage() {
  const { mutation, isLoading } = useMutation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: FeedbackValues) => {
    const res = await mutation("public/feedback", {
      method: "POST",
      body: values,
      isAlert: false,
    });
    if (res?.results?.success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Thank you for your feedback!
          </h1>
          <p className="text-gray-500 mb-8">
            Your story will appear on the site after a quick review. We really
            appreciate you sharing your experience with DevVelocity.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-16 px-4 text-center bg-gray-50 border-b border-gray-100">
        <div className="max-w-xl mx-auto">
          <span className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            Share Your Story
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            How Did DevVelocity Help You?
          </h1>
          <p className="text-gray-500 text-base">
            Your feedback helps other students make the decision to start their
            career journey. Approved reviews ★3 and above appear on our
            homepage.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <Formik
            initialValues={INITIAL}
            validationSchema={feedbackSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form noValidate className="space-y-5">
                {/* Star rating */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your Rating <span className="text-red-500">*</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFieldValue("rating", star)}
                        className="focus:outline-none"
                        aria-label={`Rate ${star} star`}
                      >
                        <svg
                          className={`w-8 h-8 transition-colors ${
                            star <= values.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    {values.rating > 0 && (
                      <span className="text-sm font-medium text-amber-500 ml-1">
                        {STAR_LABELS[values.rating]}
                      </span>
                    )}
                  </div>
                  <ErrorMessage name="rating">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="fb-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    id="fb-name"
                    name="name"
                    type="text"
                    placeholder="Arjun Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <ErrorMessage name="name">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="fb-role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Role / Company <span className="text-red-500">*</span>
                  </label>
                  <Field
                    id="fb-role"
                    name="role"
                    type="text"
                    placeholder="e.g. SDE-1 at Razorpay"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <ErrorMessage name="role">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="fb-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Field
                    id="fb-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Not displayed publicly.
                  </p>
                  <ErrorMessage name="email">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>

                {/* Feedback text */}
                <div>
                  <label
                    htmlFor="fb-text"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Experience <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    id="fb-text"
                    name="text"
                    rows={5}
                    placeholder="Tell us how DevVelocity helped you — what features did you use, what changed for you?"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <ErrorMessage name="text">
                      {(msg) => <p className="text-red-500 text-sm">{msg}</p>}
                    </ErrorMessage>
                    <p className="text-xs text-gray-400 ml-auto">
                      {values.text.length}/1000
                    </p>
                  </div>
                </div>

                <CustomButton
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  fullWidth
                >
                  Submit Feedback
                </CustomButton>

                <p className="text-xs text-center text-gray-400">
                  Reviews with ★3 or above are shown on the homepage after
                  approval.
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </section>
    </div>
  );
}
