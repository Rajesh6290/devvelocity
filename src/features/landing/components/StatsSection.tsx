"use client";

import useSwr from "@/shared/hooks/useSwr";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Trophy,
  FileText,
  Mic,
  ClipboardCheck,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalOrganizations: number;
  avgJobReadinessScore: number;
  totalResumesAnalyzed: number;
  totalInterviewsCompleted: number;
  totalAssessmentsTaken: number;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return `${n}+`;
}

const STATS_CONFIG = [
  {
    key: "totalUsers" as keyof Stats,
    label: "Students Enrolled",
    icon: Users,
    color: "text-brand",
  },
  {
    key: "totalOrganizations" as keyof Stats,
    label: "Institutes Onboarded",
    icon: Building2,
    color: "text-secondary-600",
  },
  {
    key: "totalResumesAnalyzed" as keyof Stats,
    label: "Resumes Analyzed",
    icon: FileText,
    color: "text-primary-600",
  },
  {
    key: "totalAssessmentsTaken" as keyof Stats,
    label: "Assessments Taken",
    icon: ClipboardCheck,
    color: "text-amber-600",
  },
  {
    key: "totalInterviewsCompleted" as keyof Stats,
    label: "Interviews Simulated",
    icon: Mic,
    color: "text-rose-500",
  },
  {
    key: "avgJobReadinessScore" as keyof Stats,
    label: "Avg Job Readiness",
    icon: Trophy,
    color: "text-green-600",
    suffix: "%",
  },
];

export default function StatsSection() {
  const { data } = useSwr("public/stats");
  const stats = data?.data;

  return (
    <section className="bg-gray-50 py-16 px-4 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS_CONFIG.map((item, i) => {
            const Icon = item.icon;
            const value = stats ? stats[item.key] : null;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col items-center text-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <Icon className={`w-6 h-6 ${item.color}`} />
                <div className="text-2xl font-extrabold text-gray-900">
                  {value !== null && value !== undefined
                    ? item.suffix
                      ? `${value}${item.suffix}`
                      : fmt(value)
                    : "—"}
                </div>
                <div className="text-xs text-gray-500 font-medium leading-tight">
                  {item.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
