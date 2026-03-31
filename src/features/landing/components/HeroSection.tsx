"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-white pt-20 pb-24 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-brand-100">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            AI-Powered Career Copilot
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6"
        >
          From Resume to <span className="text-brand">Job Ready</span>
          <br />
          with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          DevVelocity analyzes your resume, identifies skill gaps, generates
          personalized practice, and simulates real interviews — so you land the
          job faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/register"
            className="flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-brand/20"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/#how-it-works"
            className="flex items-center gap-2 text-gray-700 hover:text-brand font-semibold px-6 py-3.5 rounded-xl text-base border border-gray-200 hover:border-brand transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            See How It Works
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-sm text-gray-400"
        >
          15-day free trial · No credit card required · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
