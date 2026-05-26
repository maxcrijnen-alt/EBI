import { redirect } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div className="grid gap-6">
          <div className="inline-flex w-fit rounded-md border border-[color:var(--line)] px-3 py-1 text-sm text-[color:var(--muted)]">
            Tilburg University - Microeconomics: Markets and Games
          </div>
          <div className="grid gap-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Micro Mastery: Markets & Games
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              A multi-user adaptive practice system for diagnostics, AI-style tutoring, rubric feedback,
              flashcards, mock practice, mistake repair, and exam-readiness tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/auth">Start studying</ButtonLink>
            <ButtonLink href="/auth" variant="secondary">
              Log in
            </ButtonLink>
          </div>
          <p className="text-sm text-[color:var(--muted)]">
            Classmates can create their own account; progress, mistakes, flashcards, and study plans stay separate.
          </p>
        </div>
        <Card className="grid gap-5">
          <div className="flex items-end gap-3">
            {[42, 58, 35, 76, 64, 88, 71].map((height, index) => (
              <div key={height + index} className="grid flex-1 gap-2">
                <div
                  className="rounded-t-md bg-[color:var(--accent)]/80"
                  style={{ height: `${height * 2}px` }}
                />
                <span className="text-center text-xs text-[color:var(--muted)]">T{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <h2 className="text-xl font-semibold">Built around mastery, not quiz streaks</h2>
            <p className="text-sm leading-6 text-[color:var(--muted)]">
              The app estimates weak topics, adjusts question difficulty, records mistake causes, and
              keeps open-ended reasoning visible for partial credit.
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
