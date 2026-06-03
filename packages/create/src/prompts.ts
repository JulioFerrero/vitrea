import { Input, Select, Confirm, Toggle } from "@cliffy/prompt";
import { parseArgs } from "@std/cli";

export type Environment = "vps" | "local" | "cloud";
export type StorageOption = "seaweedfs" | "s3" | "skip";
export type CloudProvider = "vercel" | "railway" | "fly";
export type Framework = "fresh";

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
  const flags = parseArgs(args, {
    string: ["name", "env", "framework", "storage", "cloud"],
    boolean: ["examples", "git", "start"],
    default: { examples: true, git: true, start: false },
  });

  if (!flags.name) return null;

  const env = (flags.env || "local") as Environment;
  const storage = (flags.storage || (env === "vps" ? "seaweedfs" : "skip")) as StorageOption;
  const cloudProvider = flags.cloud as CloudProvider | undefined;

  return {
    projectName: flags.name,
    framework: (flags.framework || "fresh") as Framework,
    environment: env,
    storage,
    cloudProvider: cloudProvider || (env === "cloud" ? "vercel" : undefined),
    includeExamples: flags.examples,
    initGit: flags.git,
    startNow: flags.start && env === "local",
  };
}

export async function promptInteractive(): Promise<PromptAnswers> {
  const os = Deno.build.os;
  let osLabel = "Linux";
  if (os === "darwin") osLabel = "macOS";
  else if (os === "windows") osLabel = "Windows";

  const projectName: string = await Input.prompt({
    message: "Project name",
    default: "my-site",
  });

  const frameworkRaw = await Select.prompt({
    message: "Website framework",
    options: [
      { name: "Fresh (Deno)", value: "fresh", disabled: false },
    ],
    hint: "More frameworks coming soon",
  });

  const environmentRaw = await Select.prompt({
    message: "Where are you setting up?",
    options: [
      { name: `Local machine (${osLabel})`, value: "local" },
      { name: "VPS / Server — Docker Compose", value: "vps" },
      { name: "Cloud — Vercel, Railway, Fly.io", value: "cloud" },
    ],
  });
  const environment = environmentRaw as Environment;

  let storage: StorageOption = "skip";
  let cloudProvider: CloudProvider | undefined;

  if (environment === "vps") {
    const storageRaw = await Select.prompt({
      message: "File storage",
      options: [
        { name: "SeaweedFS (self-hosted)", value: "seaweedfs" },
        { name: "External S3", value: "s3" },
        { name: "Skip", value: "skip" },
      ],
    });
    storage = storageRaw as StorageOption;
  } else if (environment === "cloud") {
    const cloudRaw = await Select.prompt({
      message: "Cloud provider",
      options: [
        { name: "Vercel + Neon", value: "vercel" },
        { name: "Railway", value: "railway" },
        { name: "Fly.io", value: "fly" },
      ],
    });
    cloudProvider = cloudRaw as CloudProvider;
    storage = "s3";
  }

  const includeExamples: boolean = await Confirm.prompt({
    message: "Include example components?",
    default: true,
  });

  const initGit: boolean = await Toggle.prompt({
    message: "Initialize git?",
    default: true,
  });

  let startNow = false;
  if (environment === "local") {
    startNow = await Confirm.prompt({
      message: "Run setup after creation?",
      default: true,
    });
  }

  return {
    projectName,
    framework: frameworkRaw as Framework,
    environment,
    storage,
    cloudProvider,
    includeExamples,
    initGit,
    startNow,
  };
}
