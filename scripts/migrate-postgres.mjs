import "dotenv/config";
import { execFileSync } from "node:child_process";

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
