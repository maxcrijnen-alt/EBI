import Link from "next/link";
import { clsx } from "clsx";

export function Card({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: Readonly<{ href: string; children: React.ReactNode; variant?: "primary" | "secondary" }>) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-[color:var(--accent)] text-white hover:opacity-90"
          : "border border-[color:var(--line)] bg-[color:var(--panel)] hover:bg-black/[.03] dark:hover:bg-white/[.06]",
      )}
    >
      {children}
    </Link>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
}: Readonly<{ children: React.ReactNode; variant?: "primary" | "secondary" }>) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-[color:var(--accent)] text-white hover:opacity-90"
          : "border border-[color:var(--line)] bg-[color:var(--panel)] hover:bg-black/[.03] dark:hover:bg-white/[.06]",
      )}
      type="submit"
    >
      {children}
    </button>
  );
}

export function Badge({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="inline-flex items-center rounded-md border border-[color:var(--line)] px-2 py-1 text-xs font-medium text-[color:var(--muted)]">
      {children}
    </span>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: Readonly<{
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        className="min-h-11 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3 outline-none focus:border-[color:var(--accent)]"
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: Readonly<{
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        className="min-h-11 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3 outline-none focus:border-[color:var(--accent)]"
        name={name}
        defaultValue={defaultValue}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProgressBar({ value }: Readonly<{ value: number }>) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
      <div
        className="h-full rounded-full bg-[color:var(--accent)]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
