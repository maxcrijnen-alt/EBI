import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

type Prisma = Awaited<typeof import("../src/lib/db")>["prisma"];

type TopicWithSubtopics = Awaited<ReturnType<Prisma["topic"]["findMany"]>>[number] & {
  subtopics: Array<{ id: string; slug: string; title: string; description: string }>;
};

const topicKeywordHints: Record<string, string[]> = {
  "production-costs": ["fixed cost", "variable cost", "average cost", "marginal cost", "returns to scale", "tc", "vc"],
  "demand-revenue-elasticity": ["inverse demand", "elasticity", "total revenue", "marginal revenue", "price elasticity"],
  "profit-maximization": ["profit maximization", "mr = mc", "isoprofit", "shutdown", "marginal revenue", "marginal cost"],
  "perfect-competition": ["perfect competition", "price taking", "long-run equilibrium", "entry", "exit", "p = mc"],
  "monopoly-welfare": ["monopoly", "consumer surplus", "producer surplus", "deadweight loss", "pareto efficient"],
  "taxes-surplus": ["tax", "tax wedge", "incidence", "tax revenue", "deadweight loss", "surplus"],
  "price-discrimination": ["price discrimination", "consumer groups", "uniform pricing", "resale"],
  "game-theory": ["game theory", "best response", "dominant strategy", "nash", "prisoner's dilemma"],
  "social-preferences-public-goods": ["public goods", "free riding", "social preference", "fairness", "ultimatum"],
  oligopoly: ["oligopoly", "cournot", "bertrand", "collusion", "capacity", "bertrand trap"],
  "innovation-patents": ["innovation", "patent", "complementary innovation", "substitute innovation", "policy"],
  "network-effects-standards": ["network effects", "lock-in", "technical standards", "adoption", "benefit = qn - p"],
  "exam-technique": ["sample exam", "multiple choice", "open-ended", "show steps", "partial credit"],
};

function loadLocalEnv() {
  const envPath = ".env.local";
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    process.env[key] = valueParts.join("=").replace(/^"|"$/g, "");
  }
}

function normalizeFilename(value: string) {
  return path
    .basename(value)
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory() && !["node_modules", ".git", ".next"].includes(entry.name)) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile() && /\.(pdf|docx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function extractPdf(filePath: string) {
  const parser = new PDFParse({ data: await readFile(filePath) });
  try {
    const result = await parser.getText();
    return normalizeText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(filePath: string) {
  const result = await mammoth.extractRawText({ path: filePath });
  return normalizeText(result.value);
}

function chunkText(text: string, maxChars = 1800) {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current.length && current.length + paragraph.length + 2 > maxChars) {
      chunks.push(current.trim());
      current = "";
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }

  if (current.trim()) chunks.push(current.trim());
  if (!chunks.length && text.trim()) chunks.push(text.trim().slice(0, maxChars));
  return chunks;
}

function words(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9=]+/)
    .filter((word) => word.length > 2);
}

function scoreKeyword(text: string, keyword: string) {
  const lower = text.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();
  if (lower.includes(normalizedKeyword)) return normalizedKeyword.length > 8 ? 4 : 2;
  return words(keyword).filter((word) => lower.includes(word)).length;
}

function tagChunk(text: string, topics: TopicWithSubtopics[]) {
  const scored = topics
    .map((topic) => {
      const hints = [
        topic.title,
        topic.description,
        topic.slug,
        ...(topicKeywordHints[topic.slug] ?? []),
        ...topic.subtopics.flatMap((subtopic) => [subtopic.title, subtopic.description, subtopic.slug]),
      ];
      const score = hints.reduce((sum, hint) => sum + scoreKeyword(text, hint), 0);
      return { topic, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score <= 0) return { topicId: null, subtopicId: null };

  const subtopic = best.topic.subtopics
    .map((item) => ({
      subtopic: item,
      score: [item.title, item.description, item.slug].reduce((sum, hint) => sum + scoreKeyword(text, hint), 0),
    }))
    .sort((a, b) => b.score - a.score)[0];

  return {
    topicId: best.topic.id,
    subtopicId: subtopic && subtopic.score > 0 ? subtopic.subtopic.id : null,
  };
}

function hashText(value: string) {
  return createHash("sha1").update(value).digest("hex");
}

async function upsertTopicSummaries(prisma: Prisma, topics: TopicWithSubtopics[]) {
  for (const topic of topics) {
    const chunks = await prisma.sourceChunk.findMany({
      where: { topicId: topic.id },
      include: { sourceDocument: true },
      take: 10,
      orderBy: { chunkIndex: "asc" },
    });
    const sourceNames = [...new Set(chunks.map((chunk) => chunk.sourceDocument.filename))];

    await prisma.topicSummary.upsert({
      where: { topicId: topic.id },
      update: {
        summary: topic.description,
        keyFormulas: topicKeywordHints[topic.slug]?.join(", ") ?? null,
        commonTraps: `Review common traps for ${topic.title}: skipped setup, formula confusion, and weak economic interpretation.`,
        sourceNotes: `${chunks.length} extracted chunks matched this topic from ${sourceNames.length} source file(s).`,
        generatedFrom: JSON.stringify(sourceNames),
      },
      create: {
        topicId: topic.id,
        summary: topic.description,
        keyFormulas: topicKeywordHints[topic.slug]?.join(", ") ?? null,
        commonTraps: `Review common traps for ${topic.title}: skipped setup, formula confusion, and weak economic interpretation.`,
        sourceNotes: `${chunks.length} extracted chunks matched this topic from ${sourceNames.length} source file(s).`,
        generatedFrom: JSON.stringify(sourceNames),
      },
    });
  }
}

async function main() {
  loadLocalEnv();
  const { prisma } = await import("../src/lib/db");
  const sourceRoot = path.resolve(process.env.SOURCE_MATERIALS_DIR ?? path.join(process.cwd(), ".."));
  const localFiles = await listFiles(sourceRoot);
  const localByNormalized = new Map(localFiles.map((file) => [normalizeFilename(file), file]));

  const [documents, topics] = await Promise.all([
    prisma.sourceDocument.findMany({ orderBy: { filename: "asc" } }),
    prisma.topic.findMany({
      include: { subtopics: { orderBy: { orderIndex: "asc" } } },
      orderBy: { orderIndex: "asc" },
    }) as Promise<TopicWithSubtopics[]>,
  ]);

  let processed = 0;
  const missing: string[] = [];

  for (const document of documents) {
    const expectedPath = path.resolve(process.cwd(), document.path);
    const normalized = normalizeFilename(document.filename);
    const matchedPath =
      (existsSync(expectedPath) ? expectedPath : null) ??
      localByNormalized.get(normalized) ??
      localFiles.find((file) => {
        const local = normalizeFilename(file);
        return local.includes(normalized) || normalized.includes(local);
      });

    if (!matchedPath) {
      missing.push(document.filename);
      await prisma.sourceDocument.update({
        where: { id: document.id },
        data: {
          status: "MISSING",
          metadataJson: JSON.stringify({ note: "Local source file not found", sourceRoot }),
        },
      });
      continue;
    }

    const extractedText = matchedPath.toLowerCase().endsWith(".pdf")
      ? await extractPdf(matchedPath)
      : await extractDocx(matchedPath);
    const chunks = chunkText(extractedText);

    for (const [index, text] of chunks.entries()) {
      const tag = tagChunk(text, topics);
      await prisma.sourceChunk.upsert({
        where: {
          sourceDocumentId_chunkIndex: {
            sourceDocumentId: document.id,
            chunkIndex: index,
          },
        },
        update: {
          topicId: tag.topicId ?? undefined,
          subtopicId: tag.subtopicId ?? undefined,
          text,
          normalizedHash: hashText(text),
          charCount: text.length,
          metadataJson: JSON.stringify({ localFilename: path.basename(matchedPath) }),
        },
        create: {
          sourceDocumentId: document.id,
          topicId: tag.topicId ?? undefined,
          subtopicId: tag.subtopicId ?? undefined,
          chunkIndex: index,
          text,
          normalizedHash: hashText(text),
          charCount: text.length,
          metadataJson: JSON.stringify({ localFilename: path.basename(matchedPath) }),
        },
      });
    }

    await prisma.sourceChunk.deleteMany({
      where: {
        sourceDocumentId: document.id,
        chunkIndex: { gte: chunks.length },
      },
    });

    await prisma.sourceDocument.update({
      where: { id: document.id },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
        metadataJson: JSON.stringify({
          localPath: matchedPath,
          chunkCount: chunks.length,
          charCount: extractedText.length,
        }),
      },
    });

    await prisma.ingestionJob.create({
      data: {
        sourceDocumentId: document.id,
        status: "COMPLETED",
        log: `Processed ${chunks.length} chunks from ${path.basename(matchedPath)}.`,
      },
    });
    processed += 1;
  }

  await upsertTopicSummaries(prisma, topics);
  console.log(JSON.stringify({ processed, missing }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db");
    await prisma.$disconnect();
  });
