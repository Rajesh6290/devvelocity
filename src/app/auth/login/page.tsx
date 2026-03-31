"use client";

import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { saveToLocalStorage } from "@/shared/utils";

interface LoginValues {
  email: string;
  password: string;
}

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { mutation, isLoading } = useMutation();

  const handleSubmit = async (values: LoginValues) => {
    const res = await mutation("auth/login", {
      method: "POST",
      body: values,
      isAlert: true,
    });
    if (res?.results?.success) {
      const token: string = res.results.data?.accessToken;
      if (token) saveToLocalStorage("ACCESS_TOKEN", token);
      const role: string = res.results.data?.user?.role;
      const username: string = res.results.data?.user?.username ?? "";
      const orgname: string = res.results.data?.user?.orgname ?? "";
      if (role === "super_admin") router.push("/admin/dashboard");
      else if (role === "organization_admin")
        router.push(`/org/${orgname}/dashboard`);
      else router.push(`/${username}/dashboard`);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-7">
        Sign in to continue your career journey.
      </p>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-brand hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Field
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
            <ErrorMessage name="password">
              {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
            </ErrorMessage>
          </div>

          <CustomButton
            type="submit"
            variant="primary"
            loading={isLoading}
            fullWidth
          >
            Sign In
          </CustomButton>
        </Form>
      </Formik>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-brand font-semibold hover:underline"
        >
          Start free trial
        </Link>
      </p>
    </div>
  );
}
