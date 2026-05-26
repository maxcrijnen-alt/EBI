"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

type PanicPlan = {
  title: string;
  blocks: Array<{ name: string; tasks: string[] }>;
};

export function PanicPlanner() {
  const [hours, setHours] = useState("6 hours");
  const [goal, setGoal] = useState("Pass");
  const [weakest, setWeakest] = useState("Monopoly and welfare");
  const [plan, setPlan] = useState<PanicPlan | null>(null);
  const [loading, setLoading] = useState(false);

  async function createPlan() {
    setLoading(true);
    const response = await fetch("/api/panic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours, goal, weakest }),
    });
    const data = await response.json();
    setPlan(data.plan);
    setLoading(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <Card>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            How much time do you have?
            <select
              className="min-h-11 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            >
              {["2 hours", "6 hours", "1 day", "2 days", "1 week"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Goal
            <select
              className="min-h-11 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {["Pass", "7+", "8+", "Maximum possible"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            What feels weakest?
            <input
              className="min-h-11 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
              value={weakest}
              onChange={(event) => setWeakest(event.target.value)}
            />
          </label>
          <button
            className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            disabled={loading}
            onClick={createPlan}
          >
            Build panic plan
          </button>
        </div>
      </Card>
      <Card>
        {plan ? (
          <div className="grid gap-5">
            <h2 className="text-xl font-semibold">{plan.title}</h2>
            {plan.blocks.map((block) => (
              <section key={block.name} className="grid gap-2">
                <h3 className="font-semibold">{block.name}</h3>
                <ul className="grid gap-2 text-sm text-[color:var(--muted)]">
                  {block.tasks.map((task) => (
                    <li key={task} className="rounded-md border border-[color:var(--line)] p-3">
                      {task}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--muted)]">
            Choose your time, goal, and weakest area. The plan will prioritize your own weak topics and high-yield formulas.
          </p>
        )}
      </Card>
    </div>
  );
}
