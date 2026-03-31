"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Search,
  BookOpen,
  ClipboardCheck,
  Mic2,
  Briefcase,
} from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Resume",
    desc: "Upload your existing resume or build one. AI extracts and evaluates every section.",
  },
  {
    icon: Search,
    step: "02",
    title: "Identify Skill Gaps",
    desc: "Select your target role. AI compares your profile against role requirements and ranks the gaps.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Practice Weak Areas",
    desc: "AI generates topic-specific MCQ, coding, and theory questions. Difficulty adapts as you improve.",
  },
  {
    icon: ClipboardCheck,
    step: "04",
    title: "Take Assessments",
    desc: "Timed assessments built from your weak areas. Analytics track your score and progress over time.",
  },
  {
    icon: Mic2,
    step: "05",
    title: "Simulate Interviews",
    desc: "Answer AI-generated interview questions. Get scored on quality, confidence, and correctness.",
  },
  {
    icon: Briefcase,
    step: "06",
    title: "Get Job Recommendations",
    desc: "Once your readiness score crosses the threshold, get matched with relevant job openings.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3"
          >
            The Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            How DevVelocity Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-500 text-lg max-w-xl mx-auto"
          >
            A structured, AI-guided path from analysis to job readiness in 6
            clear steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-gray-100">
                    {s.step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
