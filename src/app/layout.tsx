import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/shared/provider/ToastProvider";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "DevVelocity – AI Career Copilot for Resume, Skill Gap & Job Readiness",
    template: "%s | DevVelocity",
  },
  description:
    "DevVelocity is an AI-powered career platform that helps students improve resumes, identify skill gaps, practice assessments, and become job-ready with personalized guidance.",
  keywords: [
    "AI career platform",
    "resume analyzer AI",
    "ATS resume checker",
    "skill gap analysis tool",
    "AI interview preparation",
    "job readiness platform",
    "student career guidance platform",
    "placement preparation app",
    "B.Tech placement preparation",
    "MCA job preparation",
    "coding interview practice AI",
    "resume improvement tool",
    "career roadmap generator",
    "AI assessment platform",
  ],
  authors: [{ name: "DevVelocity" }],
  creator: "DevVelocity",
  publisher: "DevVelocity",
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_APP_URL"] ?? "https://devvelocity.ai"
  ),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    title: "DevVelocity – AI Career Copilot",
    description:
      "Transform your resume into job readiness with AI-powered analysis, practice, and interview preparation.",
    siteName: "DevVelocity",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "DevVelocity" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVelocity – AI Career Copilot",
    description:
      "Improve your resume, skills, and interview readiness with AI.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
