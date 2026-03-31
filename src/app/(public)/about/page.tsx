import type { Metadata } from "next";
import { Zap, Target, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us – DevVelocity",
  description:
    "Learn about DevVelocity's mission to transform students into job-ready professionals through AI-powered career guidance.",
};

const VALUES = [
  {
    icon: Zap,
    title: "AI-First",
    desc: "Every feature is powered by AI — from resume analysis to interview simulation. No generic advice.",
  },
  {
    icon: Target,
    title: "Outcome-Driven",
    desc: "We don't just provide tools. We measure and track your job readiness until you're actually ready.",
  },
  {
    icon: Users,
    title: "Student-Focused",
    desc: "Built specifically for B.Tech, MCA, and diploma students navigating their first placement journey.",
  },
  {
    icon: Award,
    title: "Structured Path",
    desc: "A clear 6-step journey: Analyze → Gap → Practice → Assess → Interview → Job Ready.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-24 px-4 text-center bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            Our Mission
          </span>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            We Help Students Become{" "}
            <span className="text-brand">Job Ready</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            DevVelocity was built because most students graduate with degrees
            but without the skills, confidence, or preparation to land their
            dream job. We&apos;re here to change that with AI.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-5">
              The Problem We&apos;re Solving
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Every year, thousands of engineering graduates struggle to get
              placed — not because they&apos;re not smart, but because they
              don&apos;t know how to present themselves, identify their skill
              gaps, or prepare effectively for interviews.
            </p>
            <p className="text-gray-500 leading-relaxed mb-4">
              Colleges provide education, but rarely provide structured
              interview preparation, resume coaching, or skill gap analysis.
              Students are left to figure it out on their own.
            </p>
            <p className="text-gray-500 leading-relaxed">
              DevVelocity fills that gap with an AI-powered, structured,
              measurable preparation platform — available 24/7, personalized to
              every student.
            </p>
          </div>
          <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100">
            <div className="space-y-4">
              {[
                "Resume analyzed against real ATS systems",
                "Skill gaps identified against job requirements",
                "Practice questions generated from your weak areas",
                "Interview performance scored and improved",
                "Job readiness tracked as a single score",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              What We Stand For
            </h2>
            <p className="text-gray-500">
              Our core principles that shape everything we build.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-500 mb-8">
            Join DevVelocity today and start your 15-day free trial.
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-brand/20"
          >
            Start Free Trial
          </a>
        </div>
      </section>
    </div>
  );
}
