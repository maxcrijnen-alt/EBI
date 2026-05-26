import "dotenv/config";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  const path = ".env.local";
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    process.env[key] = valueParts.join("=").replace(/^"|"$/g, "");
  }
}

loadLocalEnv();

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl || directUrl.startsWith("file:")) {
  throw new Error("Set DIRECT_URL to your Supabase direct Postgres connection string before running migrations.");
}

execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: directUrl,
  },
});
