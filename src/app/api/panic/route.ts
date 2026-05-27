import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { buildPanicPlan } from "@/lib/ai";
import { prisma } from "@/lib/db";

const panicSchema = z.object({
  hours: z.string(),
  goal: z.string(),
  weakest: z.string(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = panicSchema.parse(await request.json());
  const weakTopics = await prisma.userMastery.findMany({
    where: { userId: user.id, subtopicId: null },
    orderBy: [{ mastery: "asc" }, { mistakeCount: "desc" }],
    take: 5,
    include: { topic: true },
  });

  const result = await buildPanicPlan({
    ...parsed,
    weakTopics: weakTopics.map((item) => item.topic.title),
    userId: user.id,
  });

  await prisma.studyPlan.create({
    data: {
      userId: user.id,
      title: result.plan.title,
      goal: parsed.goal,
      timeBudget: parsed.hours,
      planJson: JSON.stringify(result.plan),
    },
  });

  return NextResponse.json(result);
}
