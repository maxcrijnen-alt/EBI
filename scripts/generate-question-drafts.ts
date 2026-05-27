import { existsSync, readFileSync } from "node:fs";

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

async function main() {
  loadLocalEnv();
  const { generateFocusedDraftBatch } = await import("../src/lib/question-drafting");
  const result = await generateFocusedDraftBatch(Number(process.env.DRAFT_BANK_SIZE ?? 104));
  console.log(JSON.stringify(result, null, 2));
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
