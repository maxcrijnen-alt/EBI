import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  defaultRubricDimensions,
  flashcardSeeds,
  formulaSeeds,
  questionSeeds,
  topicSeeds,
} from "../src/lib/course-data";

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
  throw new Error("DATABASE_URL must be a Supabase/Postgres connection string before seeding.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function reset() {
  await prisma.rubricScore.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.mistake.deleteMany();
  await prisma.flashcardReview.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.mockSession.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.questionDraft.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.formulaEntry.deleteMany();
  await prisma.userMastery.deleteMany();
  await prisma.subtopic.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.session.deleteMany();
  await prisma.ingestionJob.deleteMany();
  await prisma.sourceDocument.deleteMany();
  await prisma.user.deleteMany();
}

async function seedTopics() {
  const topicMap = new Map<string, string>();
  const subtopicMap = new Map<string, string>();

  for (const topic of topicSeeds) {
    const created = await prisma.topic.create({
      data: {
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        orderIndex: topic.orderIndex,
        weight: topic.weight,
        coreSectionUrl: topic.coreSectionUrl,
      },
    });
    topicMap.set(topic.slug, created.id);

    for (const subtopic of topic.subtopics) {
      const createdSubtopic = await prisma.subtopic.create({
        data: {
          topicId: created.id,
          slug: subtopic.slug,
          title: subtopic.title,
          description: subtopic.description,
          orderIndex: subtopic.orderIndex,
        },
      });
      subtopicMap.set(`${topic.slug}:${subtopic.slug}`, createdSubtopic.id);
    }
  }

  return { topicMap, subtopicMap };
}

async function seedFormulas(topicMap: Map<string, string>) {
  for (const formula of formulaSeeds) {
    await prisma.formulaEntry.create({
      data: {
        topicId: topicMap.get(formula.topicSlug),
        title: formula.title,
        formula: formula.formula,
        meaning: formula.meaning,
        whenToUse: formula.whenToUse,
        variables: formula.variables,
        example: formula.example,
        trap: formula.trap,
        relatedTypes: formula.relatedTypes,
      },
    });
  }
}

async function seedFlashcards(topicMap: Map<string, string>, subtopicMap: Map<string, string>) {
  for (const card of flashcardSeeds) {
    await prisma.flashcard.create({
      data: {
        topicId: topicMap.get(card.topicSlug),
        subtopicId: card.subtopicSlug ? subtopicMap.get(`${card.topicSlug}:${card.subtopicSlug}`) : undefined,
        category: card.category,
        front: card.front,
        back: card.back,
        example: card.example,
        trap: card.trap,
        sourceType: "SEEDED",
        formulaTags: card.formulaTags,
      },
    });
  }
}

async function seedQuestions(topicMap: Map<string, string>, subtopicMap: Map<string, string>) {
  for (const question of questionSeeds) {
    const created = await prisma.question.create({
      data: {
        topicId: topicMap.get(question.topicSlug)!,
        subtopicId: question.subtopicSlug
          ? subtopicMap.get(`${question.topicSlug}:${question.subtopicSlug}`)
          : undefined,
        sourceType: "AI_GENERATED",
        questionType: question.questionType,
        difficulty: question.difficulty,
        prompt: question.prompt,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        wrongOptionExplanations: question.wrongOptionExplanations,
        formulaTags: question.formulaTags,
        estimatedSteps: question.estimatedSteps,
        sourceInspiration: question.sourceInspiration,
        isReviewed: question.isReviewed ?? true,
        reviewStatus: question.reviewStatus ?? "APPROVED",
      },
    });

    for (const [index, option] of (question.options ?? []).entries()) {
      await prisma.questionOption.create({
        data: {
          questionId: created.id,
          label: option.label,
          text: option.text,
          isCorrect: option.isCorrect,
          rationale: option.rationale,
          orderIndex: index,
        },
      });
    }

    if (["OPEN_ENDED", "DERIVATION", "EXPLAIN_INTUITION", "COMPARE_OUTCOMES", "FIND_THE_MISTAKE"].includes(question.questionType)) {
      await prisma.rubric.create({
        data: {
          questionId: created.id,
          name: "Open-ended exam reasoning rubric",
          maxScore: defaultRubricDimensions.length,
          dimensions: JSON.stringify(defaultRubricDimensions),
        },
      });
    }
  }
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash("mastery123", 12);

  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Demo Student",
      passwordHash,
      goalGrade: "7+",
      studyTimePerWeek: 6,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Course Admin",
      passwordHash,
      role: "ADMIN",
      goalGrade: "Deep mastery",
      studyTimePerWeek: 8,
    },
  });

  const topics = await prisma.topic.findMany({ include: { subtopics: true } });
  for (const user of [student, admin]) {
    for (const topic of topics) {
      await prisma.userMastery.create({
        data: { userId: user.id, topicId: topic.id },
      });

      for (const subtopic of topic.subtopics) {
        await prisma.userMastery.create({
          data: { userId: user.id, topicId: topic.id, subtopicId: subtopic.id },
        });
      }
    }
  }
}

async function seedSources() {
  const sources = [
    "Game Theory Problem Set - Questions.pdf",
    "Innovation and Policy - Questions.pdf",
    "Microeconomics complete summary (1).docx",
    "Oligopoly - Questions.pdf",
    "Problem Set 1 with solutions_Markets and Games.pdf",
    "Problem Set 2 with solutions_Markets and Games.pdf",
    "Problem Set 3 with solutions_Markets and Games.pdf",
    "Sample_Exam_MicroEBI.pdf",
    "Sample_Exam_MicroEBI_with_solutions.pdf",
  ];

  for (const filename of sources) {
    await prisma.sourceDocument.create({
      data: {
        filename,
        kind: filename.endsWith(".docx") ? "DOCX" : "PDF",
        path: `../${filename}`,
        status: "RAW",
        metadataJson: JSON.stringify({
          note: "Registered for later ingestion. Version 1 does not copy or quote official questions.",
        }),
      },
    });
  }
}

async function main() {
  await reset();
  const { topicMap, subtopicMap } = await seedTopics();
  await seedFormulas(topicMap);
  await seedFlashcards(topicMap, subtopicMap);
  await seedQuestions(topicMap, subtopicMap);
  await seedUsers();
  await seedSources();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
