import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { pickNextQuestion, PracticeMode, publicQuestion } from "@/lib/practice";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "adaptive") as PracticeMode;
  const topic = searchParams.get("topic");
  const question = await pickNextQuestion(user.id, mode, topic);

  return NextResponse.json({ question: publicQuestion(question) });
}
