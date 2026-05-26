import { redirect } from "next/navigation";
import { loginAction, signupAction } from "@/app/actions";
import { Card, Field, SubmitButton } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-6 px-4 py-8 md:grid-cols-2 md:items-center">
      <section className="grid gap-3">
        <h1 className="text-3xl font-semibold">Micro Mastery</h1>
        <p className="text-[color:var(--muted)]">
          Create your profile so diagnostic results, mistakes, flashcards, and readiness scores stay personal.
        </p>
        {params.error ? (
          <p className="rounded-md border border-[color:var(--warning)]/50 p-3 text-sm text-[color:var(--warning)]">
            {params.error}
          </p>
        ) : null}
      </section>
      <div className="grid gap-4">
        <Card>
          <form action={loginAction} className="grid gap-4">
            <h2 className="text-xl font-semibold">Log in</h2>
            <Field label="Email" name="email" type="email" required placeholder="student@example.com" />
            <Field label="Password" name="password" type="password" required placeholder="mastery123" />
            <SubmitButton>Log in</SubmitButton>
          </form>
        </Card>
        <Card>
          <form action={signupAction} className="grid gap-4">
            <h2 className="text-xl font-semibold">Create account</h2>
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <SubmitButton variant="secondary">Sign up</SubmitButton>
          </form>
        </Card>
      </div>
    </main>
  );
}
