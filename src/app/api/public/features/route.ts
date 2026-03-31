import { NextResponse } from "next/server";

const FEATURES = [
  {
    id: 1,
    icon: "FileSearch",
    title: "Resume Intelligence",
    description: "Upload your resume and get an instant ATS score, section-by-section analysis, and AI-generated improvement suggestions tailored to your target role.",
    color: "bg-brand-50 text-brand",
  },
  {
    id: 2,
    icon: "BarChart3",
    title: "Skill Gap Analysis",
    description: "Our AI maps your current skills against industry requirements for your target role and ranks the gaps by importance so you know exactly what to learn first.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    id: 3,
    icon: "BookOpen",
    title: "AI Learning & Practice",
    description: "Get personalized MCQ, coding, and theory questions dynamically generated from your weak areas. Difficulty adapts as you improve.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: 4,
    icon: "ClipboardCheck",
    title: "Assessment System",
    description: "Take timed, structured assessments built from your skill gaps. Get accuracy scores, completion analytics, and trend tracking over time.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: 5,
    icon: "Mic2",
    title: "AI Interview Simulator",
    description: "Simulate real interview scenarios. Answer questions via text, get scored on confidence and correctness, and receive actionable feedback.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    id: 6,
    icon: "Award",
    title: "Job Readiness Score",
    description: "A unified weighted score combining resume, skills, assessment, and interview performance — your single number to measure and track job readiness.",
    color: "bg-green-50 text-green-600",
  },
  {
    id: 7,
    icon: "Briefcase",
    title: "Job Recommendations",
    description: "Get job matches based on your skills and readiness score. Jobs are ranked by compatibility, filtered to only show roles you're ready for.",
    color: "bg-purple-50 text-purple-600",
  },
];

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({ success: true, data: FEATURES });
}
