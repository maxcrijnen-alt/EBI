import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { submitAttempt } from "@/lib/practice";

const attemptSchema = z.object({
  questionId: z.string(),
  answerText: z.string().default(""),
  selectedOptionId: z.string().optional().nullable(),
  mode: z.enum(["adaptive", "diagnostic", "mistakes", "mock"]).default("adaptive"),
  mockSessionId: z.string().optional().nullable(),
  timeSpentSeconds: z.number().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = attemptSchema.parse(await request.json());
  const result = await submitAttempt({
    userId: user.id,
    questionId: parsed.questionId,
    answerText: parsed.answerText,
    selectedOptionId: parsed.selectedOptionId,
    mode: parsed.mode,
    mockSessionId: parsed.mockSessionId,
    timeSpentSeconds: parsed.timeSpentSeconds,
  });

  return NextResponse.json(result);
}
