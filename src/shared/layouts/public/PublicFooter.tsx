import Link from "next/link";
import Image from "next/image";
import { Globe, X, Mail } from "lucide-react";
import NewsletterForm from "@/shared/common/NewsletterForm";

const FEATURE_LINKS = [
  { label: "Resume Analyzer", href: "/#features" },
  { label: "Skill Gap Analysis", href: "/#features" },
  { label: "AI Interview Prep", href: "/#features" },
  { label: "Job Readiness Score", href: "/#features" },
  { label: "Assessments", href: "/#features" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Share Feedback", href: "/feedback" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="DevVelocity" width={150} height={38} className="brightness-0 invert" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              AI-powered career platform that transforms students into job-ready
              professionals through personalized guidance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com/company/devvelocity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand transition-colors"
                aria-label="LinkedIn"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/devvelocity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand transition-colors"
                aria-label="X (Twitter)"
              >
                <X className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@devvelocity.ai"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Features
            </h3>
            <ul className="space-y-2.5">
              {FEATURE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Get career tips and platform updates in your inbox.
            </p>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DevVelocity. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
