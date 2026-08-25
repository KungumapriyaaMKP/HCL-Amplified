import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-3xl">
        🧭
      </span>
      <h1 className="mb-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
        Your learning goal, turned into a path — <span className="text-accent">personalized end to end.</span>
      </h1>
      <p className="mb-8 max-w-xl text-muted">
        Tell Pathwise what you&apos;re trying to learn. It builds a real curriculum from a skill graph, ranks resources
        by cosine similarity to your gaps, tests you for real, and adapts the plan when a test says you should
        change course.
      </p>
      <div className="flex gap-3">
        <LinkButton href="/signup" size="lg">Get started</LinkButton>
        <LinkButton href="/login" variant="secondary" size="lg">Log in</LinkButton>
      </div>

      <div className="mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
        {[
          { icon: "🧠", title: "Skill-gap analysis", body: "A real prerequisite graph finds exactly what stands between you and your goal." },
          { icon: "🎯", title: "Ranked recommendations", body: "Embeddings + cosine similarity + weighted ranking pick the best resource for you." },
          { icon: "🔁", title: "Adapts as you go", body: "Proctored results and feedback reshape the path - not just a static list." },
        ].map((f) => (
          <Card key={f.title} className="p-5 text-left">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="mb-1 text-sm font-semibold">{f.title}</h3>
            <p className="text-xs text-muted">{f.body}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
