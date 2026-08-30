export const DOMAINS = [
  { id: "web-dev", name: "Web Development", icon: "" },
  { id: "data-science", name: "Data Science", icon: "" },
  { id: "ai-ml", name: "AI & Machine Learning", icon: "" },
  { id: "cloud-devops", name: "Cloud & DevOps", icon: "" },
  { id: "mobile-dev", name: "Mobile Development", icon: "" },
  { id: "cybersecurity", name: "Cybersecurity", icon: "" },
  // Corporate & HCLTech Enterprise Engineering Domains
  { id: "gen-ai", name: "Generative AI & Enterprise LLMs", icon: "" },
  { id: "data-engineering", name: "Data Engineering & Big Data", icon: "" },
  { id: "enterprise-fullstack", name: "Enterprise Java & Microservices", icon: "" },
  { id: "embedded-iot", name: "IoT & Embedded Engineering", icon: "" },
  { id: "sre-observability", name: "SRE & Cloud Observability", icon: "" },
  { id: "product-management", name: "Digital Product Management", icon: "" },
  // Additional Enterprise, Specialized & Creative Domains
  { id: "qa-test-automation", name: "QA & Test Automation", icon: "" },
  { id: "blockchain-web3", name: "Blockchain & Web3", icon: "" },
  { id: "mainframe-modernization", name: "Mainframe & Cloud Migration", icon: "" },
  { id: "sap-enterprise-erp", name: "SAP & Enterprise ERP", icon: "" },
  { id: "game-dev", name: "Game Engine & 3D Simulation", icon: "" },
  { id: "ui-ux-design", name: "UI/UX & Design Systems", icon: "" },
] as const;

export type DomainId = (typeof DOMAINS)[number]["id"];

export const TRACK_PACES = [
  { id: "fast", name: "Fast Track", hoursPerWeek: 12, description: "Move quickly, dense modules" },
  { id: "balanced", name: "Balanced", hoursPerWeek: 6, description: "Steady, sustainable pace" },
  { id: "relaxed", name: "Relaxed", hoursPerWeek: 3, description: "Low pressure, longer runway" },
  {
    id: "crash-course",
    name: "Interview Crash Course",
    hoursPerWeek: 20,
    description: "Compressed, practice-heavy prep for an upcoming interview",
  },
] as const;

export type TrackPaceId = (typeof TRACK_PACES)[number]["id"];
