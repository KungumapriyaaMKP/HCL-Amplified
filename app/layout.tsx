import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/frontend/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pathwise — AI Learning Path Recommender",
  description: "A personalized, AI-powered learning path recommender.",
};

import { GlobalMentor } from "@/frontend/components/ui/GlobalMentor";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GlobalMentor />
      </body>
    </html>
  );
}
