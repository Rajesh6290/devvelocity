import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy – DevVelocity",
  description:
    "DevVelocity's cancellation and refund policy for subscriptions.",
};

const LAST_UPDATED = "March 1, 2026";

export default function RefundPolicyPage() {
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Refund Policy
        </h1>
        <p className="text-sm text-gray-400 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. Free Trial
            </h2>
            <p>
              All new individual accounts start with a{" "}
              <strong>15-day free trial</strong>. No payment is required during
              the trial period. If you do not subscribe after the trial ends,
              your account access is downgraded and no charge is made.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Refund Eligibility
            </h2>
            <p className="mb-3">
              We offer a <strong>7-day refund window</strong> from the date of
              your first paid subscription charge. If you are not satisfied, you
              may request a full refund within 7 days of:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your first subscription payment (new paid subscriber).</li>
              <li>An upgrade to a higher plan.</li>
            </ul>
            <p className="mt-3">
              Refunds are <strong>not available</strong> for:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Subscription renewals (monthly or annual) after the 7-day window
                has passed.
              </li>
              <li>Partial months or unused days within a billing period.</li>
              <li>
                Accounts found to have violated our{" "}
                <Link href="/terms" className="text-brand hover:underline">
                  Terms of Service
                </Link>
                .
              </li>
              <li>
                Organization plans after student seats have been activated.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Annual Plans
            </h2>
            <p>
              For annual subscriptions, a refund of the remaining unused months
              (pro-rated) may be issued at our discretion if requested within 30
              days of the annual payment and fewer than 2 months have been used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. How to Request a Refund
            </h2>
            <p className="mb-3">To request a refund:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Email{" "}
                <a
                  href="mailto:billing@devvelocity.in"
                  className="text-brand hover:underline"
                >
                  billing@devvelocity.in
                </a>{" "}
                from your registered email address.
              </li>
              <li>
                Include your username and the reason for the refund request.
              </li>
              <li>Our team will respond within 2 business days.</li>
            </ol>
            <p className="mt-3">
              Approved refunds are processed within{" "}
              <strong>5–7 business days</strong> back to your original payment
              method via Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Cancellation
            </h2>
            <p>
              You can cancel your subscription at any time from{" "}
              <strong>Account Settings → Billing</strong>. Your access continues
              until the end of the current billing period. Cancellation does not
              automatically trigger a refund unless you are within the 7-day
              refund window.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Payment Disputes
            </h2>
            <p>
              Please contact us before raising a chargeback with your bank. We
              will work with you to resolve any billing issues promptly.
              Accounts with active chargebacks may be suspended.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
            <p>
              For billing questions, reach us at{" "}
              <a
                href="mailto:billing@devvelocity.in"
                className="text-brand hover:underline"
              >
                billing@devvelocity.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
