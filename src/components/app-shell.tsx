import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Brain,
  ClipboardList,
  Flame,
  FunctionSquare,
  GraduationCap,
  Layers,
  LineChart,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import { CurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/diagnostic", label: "Diagnostic", icon: Brain },
  { href: "/practice", label: "Practice", icon: ClipboardList },
  { href: "/topics", label: "Topics", icon: Layers },
  { href: "/graphs", label: "Graphs", icon: LineChart },
  { href: "/formulas", label: "Formulas", icon: FunctionSquare },
  { href: "/flashcards", label: "Flashcards", icon: BookOpen },
  { href: "/mistakes", label: "Mistakes", icon: NotebookPen },
  { href: "/mock", label: "Mock", icon: GraduationCap },
  { href: "/panic", label: "Panic", icon: Flame },
];

export function AppShell({
  user,
  children,
}: Readonly<{ user: CurrentUser; children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-md bg-[color:var(--accent)] text-white">
              M
            </span>
            <span>Micro Mastery</span>
          </Link>
          <nav className="flex max-w-full gap-1 overflow-x-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-[color:var(--muted)] hover:bg-black/[.04] hover:text-[color:var(--foreground)] dark:hover:bg-white/[.06]"
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-[color:var(--muted)] hover:bg-black/[.04] hover:text-[color:var(--foreground)] dark:hover:bg-white/[.06]"
              >
                <ShieldCheck size={16} />
                Admin
              </Link>
            ) : null}
          </nav>
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <span className="hidden text-[color:var(--muted)] sm:inline">{user.name}</span>
            <button className="rounded-md border border-[color:var(--line)] px-3 py-2 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6">{children}</main>
    </div>
  );
}
