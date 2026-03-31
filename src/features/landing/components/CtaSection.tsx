"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="bg-brand py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-white mb-4"
        >
          Ready to Become Job Ready?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-brand-100 text-lg mb-8"
        >
          Join thousands of students who are transforming their careers with
          DevVelocity. Start your 15-day free trial today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/register"
            className="flex items-center gap-2 bg-white text-brand hover:bg-brand-50 font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-white border border-white/30 hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
          >
            View Pricing
          </Link>
        </motion.div>
        <p className="mt-5 text-sm text-brand-200">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
