"use client";

import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";

interface ForgotValues {
  email: string;
}

const forgotSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});

export default function ForgotPasswordPage() {
  const { mutation, isLoading } = useMutation();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (values: ForgotValues) => {
    const res = await mutation("auth/forgot-password", {
      method: "POST",
      body: values,
      isAlert: false,
    });
    if (res?.results?.success) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          If an account exists for that email, we&apos;ve sent a password reset
          link. It expires in 1 hour.
        </p>
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Forgot password?
      </h1>
      <p className="text-sm text-gray-500 mb-7">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={forgotSchema}
        onSubmit={handleSubmit}
      >
        <Form noValidate className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
            <ErrorMessage name="email">
              {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
            </ErrorMessage>
          </div>

          <CustomButton
            type="submit"
            variant="primary"
            loading={isLoading}
            fullWidth
          >
            Send Reset Link
          </CustomButton>
        </Form>
      </Formik>

      <p className="text-sm text-center text-gray-500 mt-6">
        Remembered it?{" "}
        <Link
          href="/auth/login"
          className="text-brand font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
