import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboardData";
import { Nav } from "@/frontend/components/layout/Nav";
import { ProfileDashboardView } from "@/frontend/components/profile/ProfileDashboardView";

export default async function ProfilePage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-sans pb-16">
      <Nav displayName={data.profile?.displayName} />
      <ProfileDashboardView data={data} userEmail={user.email} />
    </div>
  );
}
