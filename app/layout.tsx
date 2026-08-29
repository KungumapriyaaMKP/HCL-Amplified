import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/frontend/styles/globals.css";
import { GlobalMentor } from "@/frontend/components/ui/GlobalMentor";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuestLearn — AI Adaptive Learning Platform",
  description: "A personalized, AI-powered learning path recommender.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <GlobalMentor />
      </body>
    </html>
  );
}
