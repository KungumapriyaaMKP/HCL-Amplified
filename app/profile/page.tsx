import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboardData";
import { Nav } from "@/frontend/components/layout/Nav";
import { ProfileDashboardView } from "@/frontend/components/profile/ProfileDashboardView";

export default async function ProfilePage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav displayName={data.profile?.displayName} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Breadcrumb / Top Header */}
        <div className="mb-8">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
            LEARNER IDENTITY & ANALYTICS
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
            Learner Profile
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            View your masteries, retention matrix, learning velocity, and AI adaptive feedback.
          </p>
        </div>

        {/* Interactive Profile Dashboard View */}
        <ProfileDashboardView data={data} userEmail={user.email} />

      </main>
    </div>
  );
}
