import type { PromptAnswers } from "../prompts.ts";

export function envFile(answers: PromptAnswers): string {
  const dbHost = answers.environment === "vps" ? "postgres" : "localhost";
  let env = `DATABASE_URL=postgresql://hi:hi@${dbHost}:5432/${answers.projectName}\n`;
  env += `BETTER_AUTH_SECRET=change-me\n`;
  env += `BETTER_AUTH_URL=http://localhost:5173\n`;
  if (answers.storage === "seaweedfs") {
    env += `\nS3_ENDPOINT=http://seaweedfs:8333\nS3_REGION=us-east-1\nS3_BUCKET=images\n`;
    env += `S3_ACCESS_KEY=admin\nS3_SECRET_KEY=secret\nS3_FORCE_PATH_STYLE=true\n`;
  }
  env += `\nWEBSITE_ID=\n`;
  return env;
}

export function gitignore(): string {
  return `_fresh/\ndist/\nnode_modules/\n.env\n*.local\n.Denoisson/\n`;
}
