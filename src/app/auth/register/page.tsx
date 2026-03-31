"use client";

import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { saveToLocalStorage, getFromLocalStorage } from "@/shared/utils";

interface RegisterValues {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: "individual" | "organization_admin";
  orgname?: string;
}

const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, "At least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  username: Yup.string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores")
    .required("Username is required"),
  password: Yup.string()
    .min(8, "At least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  role: Yup.string()
    .oneOf(["individual", "organization_admin"])
    .required("Select account type"),
  orgname: Yup.string().when("role", {
    is: "organization_admin",
    then: (s) =>
      s
        .min(3, "At least 3 characters")
        .max(30, "Max 30 characters")
        .matches(
          /^[a-z0-9_]+$/,
          "Only lowercase letters, numbers and underscores"
        )
        .required("Organization handle is required"),
    otherwise: (s) => s.notRequired(),
  }),
});

const INITIAL: RegisterValues = {
  name: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "individual",
  orgname: "",
};

type HandleStatus = "idle" | "checking" | "available" | "taken";

async function checkHandleAvailability(
  handle: string,
  type: "username" | "orgname"
): Promise<boolean> {
  try {
    const token = getFromLocalStorage("ACCESS_TOKEN");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `/api/public/check-handle?handle=${encodeURIComponent(handle)}&type=${type}`,
      {
        method: "GET",
        headers,
      }
    );
    const json = (await res.json()) as {
      success: boolean;
      available: boolean;
    };
    return json.success && json.available;
  } catch {
    return false;
  }
}

function useHandleCheck(
  handle: string,
  type: "username" | "orgname",
  enabled: boolean
): HandleStatus {
  const [checkState, setCheckState] = useState<{
    handle: string;
    result: "available" | "taken" | "checking" | null;
  }>({ handle: "", result: null });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isValid =
    enabled && handle && handle.length >= 3 && /^[a-z0-9_]+$/.test(handle);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isValid) {
      return;
    }

    // Start checking
    timerRef.current = setTimeout(() => {
      setCheckState({ handle, result: "checking" });

      checkHandleAvailability(handle, type)
        .then((isAvailable) => {
          setCheckState((prev) => {
            // Only update if we're still checking the same handle
            if (prev.handle === handle) {
              return { handle, result: isAvailable ? "available" : "taken" };
            }
            return prev;
          });
        })
        .catch(() => {
          setCheckState((prev) => {
            if (prev.handle === handle) {
              return { handle, result: null };
            }
            return prev;
          });
        });
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handle, type, isValid]);

  if (!isValid) return "idle";
  if (checkState.handle !== handle) return "idle";
  if (checkState.result === "checking") return "checking";
  if (checkState.result === "available") return "available";
  if (checkState.result === "taken") return "taken";
  return "idle";
}

function HandleStatusIcon({ status }: { status: HandleStatus }) {
  if (status === "checking")
    return <Loader className="w-4 h-4 text-gray-400 animate-spin" />;
  if (status === "available")
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === "taken") return <XCircle className="w-4 h-4 text-red-500" />;
  return null;
}

function HandleStatusText({ status }: { status: HandleStatus }) {
  if (status === "available")
    return <p className="text-green-600 text-xs mt-1">Available ✓</p>;
  if (status === "taken")
    return (
      <p className="text-red-500 text-xs mt-1">Already taken — try another</p>
    );
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const { mutation, isLoading } = useMutation();
  const [role, setRole] = useState<"individual" | "organization_admin">(
    "individual"
  );
  const [username, setUsername] = useState("");
  const [orgname, setOrgname] = useState("");

  // Always call hooks at the top level, use enabled flag to control when they run
  const usernameStatus = useHandleCheck(
    username,
    "username",
    role === "individual"
  );
  const orgnameStatus = useHandleCheck(
    orgname,
    "orgname",
    role === "organization_admin"
  );

  const handleSubmit = async (values: RegisterValues) => {
    const res = await mutation("auth/register", {
      method: "POST",
      body: values,
      isAlert: true,
    });
    if (res?.results?.success) {
      const token: string = res.results.data?.accessToken ?? "";
      if (token) saveToLocalStorage("ACCESS_TOKEN", token);
      const userRole: string = res.results.data?.user?.role ?? "";
      const userName: string =
        res.results.data?.user?.username ?? values.username;
      const orgName: string =
        res.results.data?.user?.orgname ?? values.orgname ?? "";
      if (userRole === "organization_admin")
        router.push(`/org/${orgName}/dashboard`);
      else router.push(`/${userName}/dashboard`);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Start your free trial
      </h1>
      <p className="text-sm text-gray-500 mb-7">
        15 days free — no credit card required.
      </p>

      <Formik
        initialValues={INITIAL}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ values }) => {
          // Update local state when form values change
          if (values.role !== role) setRole(values.role);
          if (values.username !== username) setUsername(values.username);
          if (values.orgname !== orgname) setOrgname(values.orgname ?? "");

          return (
            <Form noValidate className="space-y-4">
              {/* Account type */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Account type
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      {
                        value: "individual",
                        label: "Individual",
                        sub: "Student / Job Seeker",
                      },
                      {
                        value: "organization_admin",
                        label: "Organization",
                        sub: "College / Bootcamp",
                      },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                        values.role === opt.value
                          ? "border-brand bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Field
                        type="radio"
                        name="role"
                        value={opt.value}
                        className="sr-only"
                      />
                      <span className="block text-sm font-semibold text-gray-900">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {opt.sub}
                      </span>
                    </label>
                  ))}
                </div>
                <ErrorMessage name="role">
                  {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
                </ErrorMessage>
              </div>

              {/* Full name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
                <ErrorMessage name="name">
                  {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
                </ErrorMessage>
              </div>

              {/* Email */}
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

              {/* Username / orgname */}
              {values.role === "individual" ? (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-colors overflow-hidden">
                    <span className="px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-400 py-2.5 select-none">
                      devvelocity.in/
                    </span>
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      placeholder="jane_doe"
                      className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none"
                    />
                    <span className="px-3">
                      <HandleStatusIcon status={usernameStatus} />
                    </span>
                  </div>
                  <ErrorMessage name="username">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                  <HandleStatusText status={usernameStatus} />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="orgname"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Handle
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-colors overflow-hidden">
                    <span className="px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-400 py-2.5 select-none">
                      devvelocity.in/org/
                    </span>
                    <Field
                      id="orgname"
                      name="orgname"
                      type="text"
                      placeholder="mit_college"
                      className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none"
                    />
                    <span className="px-3">
                      <HandleStatusIcon status={orgnameStatus} />
                    </span>
                  </div>
                  <ErrorMessage name="orgname">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                  <HandleStatusText status={orgnameStatus} />
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <ErrorMessage name="password">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <ErrorMessage name="confirmPassword">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>
              </div>

              <CustomButton
                type="submit"
                variant="primary"
                loading={isLoading}
                fullWidth
              >
                Create Account
              </CustomButton>

              <p className="text-xs text-center text-gray-400">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-brand hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/refund" className="text-brand hover:underline">
                  Refund Policy
                </Link>
                .
              </p>
            </Form>
          );
        }}
      </Formik>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{" "}
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
