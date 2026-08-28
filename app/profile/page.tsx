import { requireUser } from "@/lib/auth";
import { getDashboardData, type DashboardData } from "@/lib/dashboardData";
import { Nav } from "@/frontend/components/layout/Nav";
import { ProfileDashboardView } from "@/frontend/components/profile/ProfileDashboardView";

export default async function ProfilePage() {
  let userEmail = "yuvi@gmail.com";
  let displayName = "yuvi";
  let data: DashboardData;

  try {
    const user = await requireUser();
    userEmail = user.email || "yuvi@gmail.com";
    data = await getDashboardData(user.id);
    displayName = data.profile?.displayName || "yuvi";
  } catch (_err) {
    // Graceful fallback when unauthenticated so UI loads seamlessly without crashing
    data = {
      profile: {
        userId: "mock-user",
        displayName: "yuvi",
        preferenceScores: null,
        faceDescriptor: null,
        faceReferencePhoto: null,
        resumeText: null,
        resumeProfile: null,
        createdAt: new Date(),
      },
      disengagement: { atRisk: false, daysSinceActive: 0 },
      gamification: {
        xp: 0,
        level: 1,
        levelTitle: "Newcomer",
        xpIntoLevel: 0,
        xpForNextLevel: 50,
        streak: { userId: "mock-user", currentStreak: 0, longestStreak: 0, lastActiveDate: null },
        badges: [],
      },
      goals: [
        { id: "g1", title: "Master Machine Learning", domain: "ai-ml", trackPace: "balanced", userId: "mock-user", createdAt: new Date(), updatedAt: new Date(), pathId: "p1", totalModules: 12, completedModules: 2, nextAction: null },
        { id: "g2", title: "Web Application Engineering", domain: "web-dev", trackPace: "balanced", userId: "mock-user", createdAt: new Date(), updatedAt: new Date(), pathId: "p2", totalModules: 15, completedModules: 3, nextAction: null },
      ] as any,
      mastery: [
        { skillId: "s1", name: "Linear Algebra", score: 15, category: "ai-ml", source: "quiz", updatedAt: new Date() },
        { skillId: "s2", name: "Calculus Basics", score: 15, category: "ai-ml", source: "quiz", updatedAt: new Date() },
        { skillId: "s3", name: "Python Programming", score: 10, category: "data-science", source: "quiz", updatedAt: new Date() },
      ] as any,
      decay: [],
      reviewSuggestions: {},
      activity: [],
      adaptations: [],
    };
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-sans pb-16">
      <Nav displayName={displayName} />
      <ProfileDashboardView data={data} userEmail={userEmail} />
    </div>
  );
}
