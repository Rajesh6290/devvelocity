import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – DevVelocity",
  description:
    "How DevVelocity collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "March 1, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to DevVelocity (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;), operated by DevVelocity Technologies Pvt. Ltd.,
              accessible at{" "}
              <a
                href="https://devvelocity.in"
                className="text-brand hover:underline"
              >
                https://devvelocity.in
              </a>
              . We respect your privacy and are committed to protecting the
              personal information you share with us. This Privacy Policy
              explains what data we collect, how we use it, and the choices you
              have.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address,
                username, password (hashed), and account type (individual or
                organization).
              </li>
              <li>
                <strong>Profile Information:</strong> Target job role, skills,
                resume URL, LinkedIn URL, and any other career-related details
                you provide.
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used,
                session duration, and in-app activity such as assessments taken,
                resumes analysed, and interviews completed.
              </li>
              <li>
                <strong>Payment Information:</strong> Transaction IDs, plan
                type, billing cycle, and payment status. We do not store raw
                card numbers — payments are processed securely through Razorpay.
              </li>
              <li>
                <strong>Device &amp; Technical Data:</strong> IP address,
                browser type, operating system, and referring URLs (collected
                automatically via server logs).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your account.</li>
              <li>To provide and improve our AI-powered features.</li>
              <li>To personalise your career preparation journey.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>
                To send transactional emails (welcome, trial expiry,
                subscription updates, password reset).
              </li>
              <li>
                To send weekly progress reports or marketing communications
                (only if you have opted in).
              </li>
              <li>
                To analyse aggregate usage trends and improve the platform.
              </li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies</h2>
            <p>
              We use strictly necessary cookies (e.g., authentication tokens) to
              operate the service. We do not use third-party advertising
              cookies. You can disable cookies in your browser settings, but
              some features may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Data Sharing
            </h2>
            <p className="mb-3">
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Service Providers:</strong> Cloud hosting (AWS /
                Vercel), email delivery (SMTP), payment processing (Razorpay),
                and AI inference providers — all bound by data processing
                agreements.
              </li>
              <li>
                <strong>Organization Admins:</strong> If you are a student
                enrolled in an organisation account, your job readiness scores
                and progress data are visible to your organisation
                administrator.
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by applicable
                law, court order, or government authority.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Data Retention
            </h2>
            <p>
              We retain your account data for as long as your account is active.
              If you delete your account, we will permanently delete your
              personal data within 30 days, except where retention is required
              for legal compliance (e.g., payment records retained for 7 years
              as per Indian GST law).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Opt out of marketing communications at any time.</li>
              <li>
                Data portability — export your data in a machine-readable
                format.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:privacy@devvelocity.in"
                className="text-brand hover:underline"
              >
                privacy@devvelocity.in
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              8. Security
            </h2>
            <p>
              We implement industry-standard security measures including HTTPS
              encryption, hashed passwords (bcrypt), and HTTP-only
              authentication cookies. However, no method of transmission over
              the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              DevVelocity is intended for users aged 16 and above. We do not
              knowingly collect personal data from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you
              by email or via an in-app notice at least 7 days before
              significant changes take effect. Continued use of the platform
              after that date constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              11. Contact Us
            </h2>
            <p>
              For any privacy-related questions, contact us at:
              <br />
              <a
                href="mailto:privacy@devvelocity.in"
                className="text-brand hover:underline"
              >
                privacy@devvelocity.in
              </a>
              <br />
              DevVelocity Technologies Pvt. Ltd., India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
