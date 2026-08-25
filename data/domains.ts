export const DOMAINS = [
  { id: "web-dev", name: "Web Development", icon: "🌐" },
  { id: "data-science", name: "Data Science", icon: "📊" },
  { id: "ai-ml", name: "AI & Machine Learning", icon: "🤖" },
  { id: "cloud-devops", name: "Cloud & DevOps", icon: "☁️" },
  { id: "mobile-dev", name: "Mobile Development", icon: "📱" },
  { id: "cybersecurity", name: "Cybersecurity", icon: "🛡️" },
] as const;

export type DomainId = (typeof DOMAINS)[number]["id"];

export const TRACK_PACES = [
  { id: "fast", name: "Fast Track", hoursPerWeek: 12, description: "Move quickly, dense modules" },
  { id: "balanced", name: "Balanced", hoursPerWeek: 6, description: "Steady, sustainable pace" },
  { id: "relaxed", name: "Relaxed", hoursPerWeek: 3, description: "Low pressure, longer runway" },
] as const;

export type TrackPaceId = (typeof TRACK_PACES)[number]["id"];
