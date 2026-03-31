import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/shared/common/NewsletterForm";

export const metadata: Metadata = {
  title: "Blog – DevVelocity",
  description:
    "Career advice, interview tips, and job readiness guides from the DevVelocity team.",
};

const POSTS = [
  {
    slug: "#",
    tag: "Career Tips",
    title: "How to Crack Your First Campus Placement in 2026",
    excerpt:
      "A step-by-step guide covering everything from resume preparation to the final HR round that will help B.Tech students land their first job.",
    date: "March 20, 2026",
    readTime: "8 min read",
  },
  {
    slug: "#",
    tag: "Resume",
    title: "ATS-Proof Resume: What Engineering Students Get Wrong",
    excerpt:
      "Most resumes never reach a human recruiter. Learn exactly what Applicant Tracking Systems look for and how to pass them every time.",
    date: "March 14, 2026",
    readTime: "6 min read",
  },
  {
    slug: "#",
    tag: "Interview Prep",
    title: "Top 50 DSA Questions Asked in Product Companies",
    excerpt:
      "A curated list of the most frequently asked data structures and algorithm questions from companies like Flipkart, Razorpay, and Zoho.",
    date: "March 7, 2026",
    readTime: "12 min read",
  },
  {
    slug: "#",
    tag: "Skill Gap",
    title: "Why Your CGPA Doesn't Matter (And What Does)",
    excerpt:
      "Recruiters are shifting focus. Here's what actually gets you placed — practical skills, communication, and demonstrated projects.",
    date: "February 28, 2026",
    readTime: "5 min read",
  },
  {
    slug: "#",
    tag: "Learning",
    title: "Build These 5 Projects to Impress Any Recruiter",
    excerpt:
      "Not all projects are equal. These 5 project ideas demonstrate the exact skills companies want and make your resume stand out.",
    date: "February 20, 2026",
    readTime: "7 min read",
  },
  {
    slug: "#",
    tag: "AI Tools",
    title: "How AI Is Changing the Way Students Prepare for Jobs",
    excerpt:
      "From AI-powered mock interviews to instant resume feedback, explore how smart tools are giving students an unfair advantage.",
    date: "February 12, 2026",
    readTime: "5 min read",
  },
];

const TAG_COLORS: Record<string, string> = {
  "Career Tips": "bg-blue-50 text-blue-600",
  Resume: "bg-green-50 text-green-600",
  "Interview Prep": "bg-purple-50 text-purple-600",
  "Skill Gap": "bg-orange-50 text-orange-600",
  Learning: "bg-yellow-50 text-yellow-700",
  "AI Tools": "bg-brand-50 text-brand",
};

export default function BlogPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gray-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            DevVelocity Blog
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Career Insights & Tips
          </h1>
          <p className="text-lg text-gray-500">
            Practical advice to help students become job-ready faster.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-6 flex flex-col flex-1">
                <span
                  className={`inline-block self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${
                    TAG_COLORS[post.tag] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {post.tag}
                </span>
                <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {post.date} · {post.readTime}
                  </div>
                  <Link
                    href={post.slug}
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Get articles in your inbox
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Weekly career tips and platform updates. No spam, ever.
          </p>
          <NewsletterForm
            source="blog"
            inputClassName="flex-1 max-w-xs px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white text-gray-900 placeholder-gray-400"
            buttonClassName="bg-brand hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            wrapperClassName="flex flex-col sm:flex-row gap-3 justify-center"
          />
        </div>
      </section>
    </div>
  );
}
