import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isValidDomain } from "@/lib/community";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/frontend/components/layout/Nav";
import { CommunityFeed } from "@/frontend/components/community/CommunityFeed";
import { DOMAINS } from "@/data/domains";
import { DomainIcon } from "@/frontend/components/ui/DomainIcon";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default async function CommunityDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  if (!isValidDomain(domain)) redirect("/community");

  const user = await requireUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domainMeta = DOMAINS.find((d) => d.id === domain)!;

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        
        <Link href="/community" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300">
          <IconArrowLeft className="h-4 w-4" />
          <span>Back to Communities</span>
        </Link>
        
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-purple-500/40 bg-[#0d1226] p-1 shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0 overflow-hidden">
            {["web-dev", "data-science", "ai-ml", "cloud-devops", "mobile-dev", "cybersecurity"].includes(domainMeta.id) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/guilds/${domainMeta.id}.png`}
                alt={domainMeta.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <DomainIcon id={domainMeta.id} className="h-7 w-7 text-purple-400" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              DOMAIN GUILD
            </span>
            <h1 className="mt-0.5 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              {domainMeta.name} Community
            </h1>
          </div>
        </div>

        <CommunityFeed domain={domain} />
      </main>
    </div>
  );
}
