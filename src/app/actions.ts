"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, hashPassword, requireAdmin, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { approveQuestionDraft, generateFocusedDraftBatch } from "@/lib/question-drafting";
import { ensureMasteryRecords } from "@/lib/scoring";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function signupAction(formData: FormData) {
  const parsed = authSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  const existing = await prisma.user.findUnique({ where: { email: parsed.email.toLowerCase() } });
  if (existing) {
    redirect("/auth?error=Account already exists");
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.email.toLowerCase(),
      name: parsed.name ?? parsed.email.split("@")[0],
      passwordHash: await hashPassword(parsed.password),
    },
  });

  await ensureMasteryRecords(user.id);
  await createSession(user.id);
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.omit({ name: true }).parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const user = await prisma.user.findUnique({ where: { email: parsed.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.password, user.passwordHash))) {
    redirect("/auth?error=Invalid email or password");
  }

  await ensureMasteryRecords(user.id);
  await createSession(user.id);
  redirect(user.diagnosticCompleted ? "/dashboard" : "/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function onboardingAction(formData: FormData) {
  const user = await requireUser();
  const examDateValue = String(formData.get("examDate") ?? "");
  const studyTimePerWeek = Number(formData.get("studyTimePerWeek") ?? 5);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      goalGrade: String(formData.get("goalGrade") ?? "7+"),
      studyTimePerWeek: Number.isFinite(studyTimePerWeek) ? studyTimePerWeek : 5,
      examDate: examDateValue ? new Date(examDateValue) : null,
    },
  });

  await ensureMasteryRecords(user.id);
  await createStudyPlanForUser(user.id, "Initial adaptive study route");
  redirect("/diagnostic");
}

async function weakTopicNames(userId: string) {
  const weak = await prisma.userMastery.findMany({
    where: { userId, subtopicId: null },
    orderBy: [{ mastery: "asc" }, { mistakeCount: "desc" }],
    take: 5,
    include: { topic: true },
  });

  return weak.map((item) => item.topic.title);
}

async function createStudyPlanForUser(userId: string, title: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const weakTopics = await weakTopicNames(userId);
  const goal = user?.goalGrade ?? "7+";
  const timeBudget = `${user?.studyTimePerWeek ?? 5} hours/week`;
  const plan = {
    goal,
    timeBudget,
    recommendedRoute: [
      "Finish or refresh the diagnostic test.",
      ...weakTopics.map((topic) => `Repair weak topic: ${topic}`),
      "Do one mixed adaptive set with explanations hidden until after answering.",
      "Review mistakes and convert weak answers into flashcards.",
      "Write two open-ended answers with formula, setup, substitution, final answer, and interpretation.",
    ],
    weeklyLoop: [
      "20 minutes flashcards",
      "30 minutes adaptive practice",
      "20 minutes mistake notebook",
      "20 minutes open-ended rubric practice",
    ],
  };

  return prisma.studyPlan.create({
    data: {
      userId,
      title,
      goal,
      timeBudget,
      examDate: user?.examDate ?? undefined,
      planJson: JSON.stringify(plan),
    },
  });
}

export async function createStudyPlanAction() {
  const user = await requireUser();
  await createStudyPlanForUser(user.id, "Updated adaptive study plan");
  revalidatePath("/study-plan");
  redirect("/study-plan");
}

export async function markMistakeReviewedAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  await prisma.mistake.updateMany({
    where: { id, userId: user.id },
    data: { reviewed: true },
  });

  revalidatePath("/mistakes");
}

export async function markMistakeFixedAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  await prisma.mistake.updateMany({
    where: { id, userId: user.id },
    data: { fixedLater: true, reviewed: true },
  });

  revalidatePath("/mistakes");
}

export async function reviewQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "PENDING");

  await prisma.question.update({
    where: { id },
    data: {
      reviewStatus: status,
      isReviewed: status === "APPROVED",
    },
  });

  revalidatePath("/admin");
}

export async function generateDraftBatchAction() {
  await requireAdmin();
  await generateFocusedDraftBatch(104);
  revalidatePath("/admin");
}

export async function updateQuestionDraftAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const difficulty = Number(formData.get("difficulty") ?? 2);
  const optionsJson = String(formData.get("optionsJson") ?? "").trim();

  if (optionsJson) {
    JSON.parse(optionsJson);
  }

  await prisma.questionDraft.update({
    where: { id },
    data: {
      questionType: String(formData.get("questionType") ?? "OPEN_ENDED"),
      difficulty: Number.isFinite(difficulty) ? difficulty : 2,
      prompt: String(formData.get("prompt") ?? ""),
      answer: String(formData.get("answer") ?? ""),
      explanation: String(formData.get("explanation") ?? ""),
      optionsJson: optionsJson || null,
      wrongOptionExplanations: String(formData.get("wrongOptionExplanations") ?? "") || null,
      formulaTags: String(formData.get("formulaTags") ?? "") || null,
      estimatedSteps: String(formData.get("estimatedSteps") ?? "") || null,
      sourceInspiration: String(formData.get("sourceInspiration") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
      status: "DRAFT",
    },
  });

  revalidatePath("/admin");
}

export async function approveQuestionDraftAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await approveQuestionDraft(id);
  revalidatePath("/admin");
}

export async function rejectQuestionDraftAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.questionDraft.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath("/admin");
}
