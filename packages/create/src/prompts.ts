import { parseArgs } from "node:util";
import process from "node:process";
import prompts from "prompts";

export type Environment = "vps" | "local" | "cloud";
export type StorageOption = "seaweedfs" | "s3" | "skip";
export type CloudProvider = "vercel" | "railway" | "fly";
export type Framework = "next";

export interface PromptAnswers {
  projectName: string;
  framework: Framework;
  environment: Environment;
  storage: StorageOption;
  cloudProvider?: CloudProvider;
  includeExamples: boolean;
  initGit: boolean;
  startNow: boolean;
}

export function parseFlags(args: string[]): PromptAnswers | null {
  const { values } = parseArgs({
    args,
    options: {
      name: { type: "string", short: "n" },
      env: { type: "string" },
      framework: { type: "string" },
      storage: { type: "string" },
      cloud: { type: "string" },
      examples: { type: "boolean", default: true },
      git: { type: "boolean", default: true },
      start: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  if (!values.name) return null;

  const env = (values.env ?? "local") as Environment;
  const storage = (values.storage ?? (env === "vps" ? "seaweedfs" : "skip")) as StorageOption;
  const cloudProvider = values.cloud as CloudProvider | undefined;

  return {
    projectName: values.name,
    framework: (values.framework ?? "next") as Framework,
    environment: env,
    storage,
    cloudProvider: cloudProvider || (env === "cloud" ? "vercel" : undefined),
    includeExamples: values.examples ?? true,
    initGit: values.git ?? true,
    startNow: Boolean(values.start) && env === "local",
  };
}

function onCancel(): never {
  throw new Error("Prompt cancelled");
}

export async function promptInteractive(): Promise<PromptAnswers> {
  const osMap: Record<string, string> = {
    darwin: "macOS",
    win32: "Windows",
    linux: "Linux",
  };
  const osLabel = osMap[process.platform] ?? process.platform;

  const project = await prompts({
    type: "text",
    name: "projectName",
    message: "Project name",
    initial: "my-site",
  }, { onCancel });

  const framework = await prompts({
    type: "select",
    name: "framework",
    message: "Website framework",
    choices: [
      { title: "Next.js", value: "next" },
    ],
    initial: 0,
  }, { onCancel });

  const environmentAnswer = await prompts({
    type: "select",
    name: "environment",
    message: "Where are you setting up?",
    choices: [
      { title: `Local machine (${osLabel})`, value: "local" },
      { title: "VPS / Server - Docker Compose", value: "vps" },
      { title: "Cloud - Vercel, Railway, Fly.io", value: "cloud" },
    ],
    initial: 0,
  }, { onCancel });
  const environment = environmentAnswer.environment as Environment;

  let storage: StorageOption = "skip";
  let cloudProvider: CloudProvider | undefined;

  if (environment === "vps") {
    const storageAnswer = await prompts({
      type: "select",
      name: "storage",
      message: "File storage",
      choices: [
        { title: "SeaweedFS (self-hosted)", value: "seaweedfs" },
        { title: "External S3", value: "s3" },
        { title: "Skip", value: "skip" },
      ],
      initial: 0,
    }, { onCancel });
    storage = storageAnswer.storage as StorageOption;
  } else if (environment === "cloud") {
    const cloudAnswer = await prompts({
      type: "select",
      name: "cloudProvider",
      message: "Cloud provider",
      choices: [
        { title: "Vercel + Neon", value: "vercel" },
        { title: "Railway", value: "railway" },
        { title: "Fly.io", value: "fly" },
      ],
      initial: 0,
    }, { onCancel });
    cloudProvider = cloudAnswer.cloudProvider as CloudProvider;
    storage = "s3";
  }

  const toggles = await prompts([
    {
      type: "confirm",
      name: "includeExamples",
      message: "Include example components?",
      initial: true,
    },
    {
      type: "confirm",
      name: "initGit",
      message: "Initialize git?",
      initial: true,
    },
    environment === "local"
      ? {
          type: "confirm",
          name: "startNow",
          message: "Run setup after creation?",
          initial: true,
        }
      : {
          type: null,
          name: "startNow",
        },
  ], { onCancel });

  return {
    projectName: project.projectName,
    framework: framework.framework as Framework,
    environment,
    storage,
    cloudProvider,
    includeExamples: toggles.includeExamples,
    initGit: toggles.initGit,
    startNow: Boolean(toggles.startNow),
  };
}
