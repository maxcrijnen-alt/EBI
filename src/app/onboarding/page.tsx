import { onboardingAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, Field, SelectField, SubmitButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Set your study target</h1>
        <p className="text-[color:var(--muted)]">
          Recommendations and difficulty progression will adapt to this target.
        </p>
      </section>
      <Card className="max-w-2xl">
        <form action={onboardingAction} className="grid gap-4">
          <SelectField
            label="Goal grade"
            name="goalGrade"
            defaultValue={user.goalGrade}
            options={["Just pass", "6+", "7+", "8+", "9+", "Deep mastery"]}
          />
          <Field label="Hours available per week" name="studyTimePerWeek" type="number" defaultValue={6} />
          <Field label="Exam date, if known" name="examDate" type="date" />
          <SubmitButton>Start diagnostic</SubmitButton>
        </form>
      </Card>
    </AppShell>
  );
}
