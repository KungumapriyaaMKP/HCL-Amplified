import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "@/frontend/styles/globals.css";
import { GlobalMentor } from "@/frontend/components/ui/GlobalMentor";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://questlearn.app"),
  title: {
    default: "QuestLearn | AI Adaptive Learning & Mastery Platform",
    template: "%s | QuestLearn",
  },
  description:
    "Personalized AI-powered adaptive learning pathways, hands-on coding labs, proctored benchmarks, and official domain mastery certifications.",
  keywords: [
    "Adaptive Learning",
    "AI Education",
    "Skill Mastery",
    "Coding Labs",
    "Machine Learning",
    "Cloud Computing",
    "Proctored Exam",
    "Domain Certification",
  ],
  authors: [{ name: "QuestLearn AI Board" }],
  creator: "QuestLearn",
  publisher: "QuestLearn Academy",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://questlearn.app",
    siteName: "QuestLearn Academy",
    title: "QuestLearn | AI Adaptive Learning & Mastery Platform",
    description:
      "Master engineering, AI, and cloud domains with personalized AI pathways, live compiler labs, and verified credentials.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuestLearn | AI Adaptive Learning & Mastery Platform",
    description:
      "Master engineering, AI, and cloud domains with personalized AI pathways, live compiler labs, and verified credentials.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-purple-600 selection:text-white">
        {children}
        <GlobalMentor />
      </body>
    </html>
  );
}
