"use client";

import { motion } from "framer-motion";
import {
  FileSearch,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Mic2,
  Award,
  Briefcase,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume Intelligence",
    description:
      "Upload your resume and get an instant ATS score, section-by-section analysis, and AI-generated improvement suggestions tailored to your target role.",
    color: "bg-brand-50 text-brand",
  },
  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    description:
      "Our AI maps your current skills against industry requirements for your target role and ranks the gaps by importance so you know exactly what to learn first.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: BookOpen,
    title: "AI Learning & Practice",
    description:
      "Get personalized MCQ, coding, and theory questions dynamically generated from your weak areas. Difficulty adapts as you improve.",
    color: "bg-secondary-50 text-secondary-600",
  },
  {
    icon: ClipboardCheck,
    title: "Assessment System",
    description:
      "Take timed, structured assessments built from your skill gaps. Get accuracy scores, completion analytics, and trend tracking over time.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Mic2,
    title: "AI Interview Simulator",
    description:
      "Simulate real interview scenarios. Answer questions via text, get scored on confidence and correctness, and receive actionable feedback.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Award,
    title: "Job Readiness Score",
    description:
      "A unified weighted score combining resume, skills, assessment, and interview performance — your single number to measure and track job readiness.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Briefcase,
    title: "Job Recommendations",
    description:
      "Get job matches based on your skills and readiness score. Jobs are ranked by compatibility, filtered to only show roles you're ready for.",
    color: "bg-violet-50 text-violet-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3"
          >
            Everything You Need
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            All-in-One Career Platform
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Seven powerful modules that work together to guide you from where
            you are to where you want to be.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-brand-100 transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
