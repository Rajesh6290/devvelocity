"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import useSwr from "@/shared/hooks/useSwr";
import type { PlanConfig } from "@/shared/config/plans";

interface PlansApiResponse {
  success: boolean;
  data: {
    individual: PlanConfig[];
    organization: PlanConfig[];
  };
}

function PlanCard({ plan, yearly }: { plan: PlanConfig; yearly: boolean }) {
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const monthlyEquiv = yearly
    ? Math.round(plan.priceYearly / 12)
    : plan.priceMonthly;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
        plan.isPopular ? "border-brand ring-2 ring-brand/20" : "border-gray-200"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand text-white text-xs font-bold px-4 py-1 rounded-full shadow">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
      </div>

      <div className="mb-6">
        {price === 0 ? (
          <div className="text-3xl font-extrabold text-gray-900">Free</div>
        ) : (
          <>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{monthlyEquiv.toLocaleString("en-IN")}
              </span>
              <span className="text-gray-400 mb-1">/mo</span>
            </div>
            {yearly && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                ₹{plan.priceYearly.toLocaleString("en-IN")} billed yearly
              </p>
            )}
          </>
        )}
        {plan.trialDays > 0 && (
          <p className="text-xs text-brand font-semibold mt-1">
            {plan.trialDays}-day free trial
          </p>
        )}
      </div>

      <Link
        href="/auth/register"
        className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold mb-6 transition-colors ${
          plan.isPopular
            ? "bg-brand text-white hover:bg-brand-600"
            : "border border-brand text-brand hover:bg-brand-50"
        }`}
      >
        {plan.id === "trial" ? "Start Free Trial" : `Get ${plan.name}`}
      </Link>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
        {plan.notIncluded.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
            <X className="w-4 h-4 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [tab, setTab] = useState<"individual" | "organization">("individual");

  const { data: rawData, isLoading } = useSwr("public/plans");
  const plans = rawData as PlansApiResponse["data"] | undefined;

  const displayPlans: PlanConfig[] =
    tab === "individual"
      ? (plans?.individual ?? []).filter((p: PlanConfig) => p.id !== "trial")
      : (plans?.organization ?? []);

  return (
    <section id="pricing" className="bg-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            Pricing
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Start free for 15 days. No credit card required.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            {(["individual", "organization"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                  tab === t
                    ? "bg-white text-brand shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t === "individual" ? "Individual" : "Organization"}
              </button>
            ))}
          </div>
        </div>

        {/* Billing toggle */}
        {tab === "individual" && (
          <div className="flex items-center justify-center gap-3 mb-10">
            <span
              className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-400"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setYearly((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                yearly ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  yearly ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${yearly ? "text-gray-900" : "text-gray-400"}`}
            >
              Yearly{" "}
              <span className="text-green-600 font-bold text-xs">Save 30%</span>
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              displayPlans.length === 1
                ? "max-w-sm mx-auto"
                : displayPlans.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {displayPlans.map((plan: PlanConfig) => (
              <PlanCard key={plan.id} plan={plan} yearly={yearly} />
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a{" "}
          <span className="font-semibold text-gray-600">15-day free trial</span>{" "}
          when you first sign up. &nbsp;
          <Link href="/contact" className="text-brand hover:underline">
            Contact us
          </Link>{" "}
          for custom enterprise pricing.
        </p>
      </div>
    </section>
  );
}
