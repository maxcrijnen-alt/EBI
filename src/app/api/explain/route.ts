import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { explainQuestion } from "@/lib/ai";
import { findQuestionById } from "@/lib/practice";

const explainSchema = z.object({
  questionId: z.string(),
  style: z.string().default("step"),
  userAnswer: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = explainSchema.parse(await request.json());
  const question = await findQuestionById(parsed.questionId);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const explanation = await explainQuestion({
    question,
    style: parsed.style,
    userAnswer: parsed.userAnswer,
  });

  return NextResponse.json({ explanation });
}
