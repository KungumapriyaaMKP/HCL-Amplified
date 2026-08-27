"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, hasSupabase } from "@/lib/supabase/client";

export default function OnboardingIndexPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      if (!hasSupabase()) {
        router.replace("/onboarding/history");
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const status = user?.user_metadata?.onboarding_status;

        const stepMap: Record<string, string> = {
          history_pending: "/onboarding/history",
          discovery_pending: "/onboarding/discovery",
          role_pending: "/onboarding/role",
          diagnostic_pending: "/onboarding/diagnostic",
          completed: "/roadmap",
        };

        if (status && stepMap[status]) {
          router.replace(stepMap[status]);
        } else {
          router.replace("/onboarding/history");
        }
      } catch {
        router.replace("/onboarding/history");
      }
    }
    checkStatus();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-xs text-muted animate-pulse">
        Initializing onboarding...
      </div>
    </div>
  );
}
