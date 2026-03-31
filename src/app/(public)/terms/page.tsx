import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service – DevVelocity",
  description:
    "Terms and conditions governing your use of the DevVelocity platform.",
};

const LAST_UPDATED = "March 1, 2026";

export default function TermsOfServicePage() {
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-400 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or using DevVelocity (&ldquo;the
              Service&rdquo;), operated by DevVelocity Technologies Pvt. Ltd.
              (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you
              agree to be bound by these Terms of Service. If you do not agree,
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Description of Service
            </h2>
            <p>
              DevVelocity is an AI-powered career preparation platform that
              provides tools including resume analysis, skill gap analysis, mock
              assessments, AI interview simulation, and job readiness scoring.
              Features available to you depend on your subscription plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Account Registration
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You must provide accurate and complete information during
                registration.
              </li>
              <li>
                Your username and organization handle are permanent URL
                identifiers and cannot be changed after registration.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                password and all activity under your account.
              </li>
              <li>You must be at least 16 years old to use the Service.</li>
              <li>
                One person may not maintain more than one free or trial account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Plans &amp; Subscriptions
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free Trial:</strong> New individual accounts receive a
                15-day trial with access to core features. No credit card is
                required to start a trial.
              </li>
              <li>
                <strong>Paid Plans:</strong> After the trial, continued access
                requires a paid subscription (Plus, Pro, Unlimited, or
                Organization plan). Pricing is listed at{" "}
                <Link href="/pricing" className="text-brand hover:underline">
                  devvelocity.in/pricing
                </Link>
                .
              </li>
              <li>
                <strong>Billing:</strong> Subscriptions are billed monthly or
                annually in advance. All prices are in Indian Rupees (INR) and
                inclusive of applicable taxes.
              </li>
              <li>
                <strong>Auto-Renewal:</strong> Subscriptions auto-renew unless
                cancelled before the renewal date.
              </li>
              <li>
                <strong>Plan Limits:</strong> Each plan has usage limits (e.g.,
                number of resume analyses, interview sessions). Limits are
                described on the pricing page.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Organization Accounts
            </h2>
            <p className="mb-3">
              Organizations (colleges, training institutes, bootcamps) may
              subscribe under the Organization plan. The organization
              administrator:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Is responsible for all activity within the organization account.
              </li>
              <li>
                May invite students who will have access to features within the
                organization&apos;s plan.
              </li>
              <li>
                Can view aggregate analytics and individual student progress
                data.
              </li>
              <li>
                Must ensure students are informed that their data is shared with
                the administrator.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Acceptable Use
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>
                Attempt to reverse-engineer, scrape, or extract AI models or
                training data from the platform.
              </li>
              <li>
                Share account credentials or allow others to access your
                account.
              </li>
              <li>Upload harmful, abusive, or offensive content.</li>
              <li>
                Use automated bots, scripts, or tools to interact with the
                platform without prior written consent.
              </li>
              <li>
                Interfere with the security or performance of the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. Intellectual Property
            </h2>
            <p>
              All content, branding, AI models, and software on the platform are
              owned by DevVelocity Technologies Pvt. Ltd. You retain ownership
              of content you upload (e.g., your resume). By uploading content,
              you grant us a limited licence to process it for the purpose of
              delivering the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              8. Disclaimer &amp; Limitation of Liability
            </h2>
            <p className="mb-3">
              The Service is provided &ldquo;as is&rdquo; without warranties of
              any kind. We do not guarantee job placement or employment
              outcomes.
            </p>
            <p>
              To the maximum extent permitted by law, DevVelocity&apos;s total
              liability for any claim shall not exceed the amount you paid in
              the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account for
              violations of these Terms, without prior notice. You may delete
              your account at any time from your account settings. Termination
              does not entitle you to a refund except as provided in our{" "}
              <Link href="/refund" className="text-brand hover:underline">
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              10. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of the courts in
              Bangalore, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              11. Changes to Terms
            </h2>
            <p>
              We may update these Terms. We will notify you at least 7 days
              before material changes take effect via email or in-app notice.
              Continued use after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              12. Contact
            </h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a
                href="mailto:legal@devvelocity.in"
                className="text-brand hover:underline"
              >
                legal@devvelocity.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
