"use client";

import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";

interface ResetValues {
  password: string;
  confirmPassword: string;
}

const resetSchema = Yup.object({
  password: Yup.string()
    .min(8, "At least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutation, isLoading } = useMutation();
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h1>
        <p className="text-sm text-gray-500 mb-6">
          This password reset link is missing a token. Please request a new one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Password updated!
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Your password has been reset successfully. Sign in with your new
          password.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-brand hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async (values: ResetValues) => {
    const res = await mutation("auth/reset-password", {
      method: "POST",
      body: { token, password: values.password },
      isAlert: true,
    });
    if (res?.results?.success) {
      setDone(true);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Set new password
      </h1>
      <p className="text-sm text-gray-500 mb-7">
        Choose a strong password for your account.
      </p>

      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={resetSchema}
        onSubmit={handleSubmit}
      >
        <Form noValidate className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
            <ErrorMessage name="password">
              {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
            </ErrorMessage>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <Field
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
            <ErrorMessage name="confirmPassword">
              {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
            </ErrorMessage>
          </div>

          <CustomButton
            type="submit"
            variant="primary"
            loading={isLoading}
            fullWidth
          >
            Reset Password
          </CustomButton>
        </Form>
      </Formik>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-sm text-gray-400">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
