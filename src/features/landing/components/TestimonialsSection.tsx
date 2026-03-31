"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MessageSquarePlus } from "lucide-react";
import useSwr from "@/shared/hooks/useSwr";

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
}

interface TestimonialsResponse {
  success: boolean;
  data: Testimonial[];
}

const AVATAR_COLORS = [
  "bg-brand",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-green-600",
  "bg-cyan-600",
  "bg-blue-500",
  "bg-pink-500",
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TestimonialsSection() {
  const { data: rawData, isLoading } = useSwr("public/testimonials");
  const res = rawData as TestimonialsResponse | undefined;
  const testimonials = res?.data ?? [];

  return (
    <section className="bg-gray-50 py-24 px-4 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3"
          >
            Student Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Real Students. Real Placements.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-xl mx-auto"
          >
            Join thousands of students who turned their career around with
            DevVelocity.
          </motion.p>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 h-52 animate-pulse"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((__, s) => (
                    <div key={s} className="w-4 h-4 rounded bg-gray-100" />
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-24" />
                    <div className="h-2.5 bg-gray-100 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && testimonials.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">
              No reviews yet. Be the first to share your experience!
            </p>
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-600 transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Share Your Story
            </Link>
          </div>
        )}

        {/* Cards */}
        {!isLoading && testimonials.length > 0 && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {testimonials.map((t, idx) => (
                <motion.div
                  key={`${t.name}-${idx}`}
                  variants={cardVariants}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s < t.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div
                      className={`w-10 h-10 rounded-full ${
                        AVATAR_COLORS[idx % AVATAR_COLORS.length]
                      } flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {initials(t.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-10">
              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:underline"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Share your story
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
