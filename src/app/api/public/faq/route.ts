import { NextResponse } from "next/server";

export const revalidate = 86400;

const FAQ = [
  {
    id: "1",
    category: "getting-started",
    question: "What is DevVelocity?",
    answer:
      "DevVelocity is an AI-powered career platform that helps students and job seekers improve their resume, identify skill gaps, practice with assessments, simulate interviews, and track their job readiness score — all in one place.",
  },
  {
    id: "2",
    category: "getting-started",
    question: "How do I get started?",
    answer:
      "Sign up for a free 15-day trial — no credit card required. Once registered, upload your resume and our AI will analyze it instantly and guide your next steps.",
  },
  {
    id: "3",
    category: "trial",
    question: "What is included in the 15-day trial?",
    answer:
      "The trial gives you access to resume analysis, skill gap identification, 3 assessments, 2 AI interview simulations, and your job readiness score. It is fully functional so you can evaluate the platform before choosing a paid plan.",
  },
  {
    id: "4",
    category: "trial",
    question: "Does the trial require a credit card?",
    answer:
      "No. You can start your 15-day trial without entering any payment information.",
  },
  {
    id: "5",
    category: "plans",
    question: "What plans are available after the trial?",
    answer:
      "We offer Plus (₹299/month), Pro (₹599/month), and Unlimited (₹999/month) for individual users. For colleges and institutes, we have the Organization plan starting at ₹4,999/month for up to 200 students.",
  },
  {
    id: "6",
    category: "plans",
    question: "Can I switch plans?",
    answer:
      "Yes. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect from the next billing cycle.",
  },
  {
    id: "7",
    category: "plans",
    question: "Do you offer yearly billing?",
    answer:
      "Yes. All plans offer yearly billing at a discounted rate — up to 30% savings compared to monthly billing.",
  },
  {
    id: "8",
    category: "features",
    question: "How does the AI resume analyzer work?",
    answer:
      "Our AI extracts your resume content, identifies sections (skills, education, projects), compares against industry standards for your target role, generates an ATS score, and provides specific improvement suggestions.",
  },
  {
    id: "9",
    category: "features",
    question: "What is the Job Readiness Score?",
    answer:
      "The Job Readiness Score is a weighted composite of your resume score, skill score, assessment score, and interview score. It gives you a single percentage that reflects how ready you are for your target role.",
  },
  {
    id: "10",
    category: "features",
    question: "How does the AI Interview Simulator work?",
    answer:
      "The simulator generates role-specific interview questions based on your resume. You answer them via text, and the AI evaluates the quality, correctness, and confidence of your responses, then provides detailed feedback.",
  },
  {
    id: "11",
    category: "organization",
    question: "What is the Organization plan?",
    answer:
      "The Organization plan is designed for colleges, institutes, and training centers. It gives your students full platform access under a single subscription, and provides you with a dashboard to track their collective performance and placement readiness.",
  },
  {
    id: "12",
    category: "organization",
    question: "How do I add students to my organization?",
    answer:
      "From your organization dashboard, go to Manage Students and send email invitations. Students accept the invite and are automatically linked to your organization.",
  },
  {
    id: "13",
    category: "payments",
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI, debit/credit cards, net banking, and wallets via Razorpay. All transactions are secured and encrypted.",
  },
  {
    id: "14",
    category: "payments",
    question: "Is there a refund policy?",
    answer:
      "Yes. If you are not satisfied within 7 days of your first paid subscription, contact us at support@devvelocity.in for a full refund.",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: FAQ });
}
