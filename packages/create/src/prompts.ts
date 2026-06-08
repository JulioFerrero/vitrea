import process from "node:process";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  note,
  outro,
  select,
  text,
} from "@clack/prompts";

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

export interface CreateFlagOptions {
  name?: string;
  env?: string;
  framework?: string;
  storage?: string;
  cloud?: string;
  examples?: boolean;
  git?: boolean;
  start?: boolean;
}

type PromptTextOptions = Omit<Parameters<typeof text>[0], "message">;
type PromptSelectOption<T extends string> = Parameters<typeof select<T>>[0]["options"][number];

const ENVIRONMENTS = ["vps", "local", "cloud"] as const;
const STORAGE_OPTIONS = ["seaweedfs", "s3", "skip"] as const;
const CLOUD_PROVIDERS = ["vercel", "railway", "fly"] as const;
const FRAMEWORKS = ["next"] as const;

function onCancel(): never {
  cancel("Operation cancelled.");
  process.exit(0);
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    onCancel();
  }

  return value as T;
}

function parseChoice<T extends readonly string[]>(
  value: string | undefined,
  allowed: T,
  flagName: string,
): T[number] | undefined {
  if (!value) {
    return undefined;
  }

  const match = allowed.find((option) => option === value);
  if (match) {
    return match;
  }

  throw new Error(`${flagName} must be one of: ${allowed.join(", ")}`);
}

export function showIntro(version: string, title: string, subtitle: string): void {
  intro(`Vitrea CLI v${version}`);
  note(subtitle, title);
}

export function showSummary(title: string, entries: Array<[string, string | boolean | undefined]>): void {
  const body = entries
    .filter(([, value]) => value !== undefined)
    .map(([label, value]) => {
      let formattedValue: string;
      if (typeof value === "boolean") {
        formattedValue = value ? "yes" : "no";
      } else {
        formattedValue = value ?? "";
      }
      return `${label.padEnd(12)} ${formattedValue}`;
    })
    .join("\n");

  note(body, title);
}

export function showNote(title: string, body: string): void {
  note(body, title);
}

export function showOutro(message: string): void {
  outro(message);
}

export async function promptText(message: string, options: PromptTextOptions = {}): Promise<string> {
  return unwrapPrompt(await text({
    message,
    placeholder: options.placeholder,
    defaultValue: options.defaultValue,
    initialValue: options.initialValue,
    validate: options.validate,
  }));
}

export async function promptConfirm(message: string, initialValue = true): Promise<boolean> {
  return unwrapPrompt(await confirm({
    message,
    initialValue,
  }));
}

export async function promptSelect<T extends string>(
  message: string,
  options: Array<PromptSelectOption<T>>,
  initialValue?: T,
): Promise<T> {
  return unwrapPrompt(await select({
    message,
    options,
    initialValue,
  }));
}

export function normalizeCreateOptions(options: CreateFlagOptions): PromptAnswers | null {
  if (!options.name) {
    return null;
  }

  const environment = parseChoice(options.env, ENVIRONMENTS, "--env") ?? "local";
  const framework = parseChoice(options.framework, FRAMEWORKS, "--framework") ?? "next";
  const cloudProvider = parseChoice(options.cloud, CLOUD_PROVIDERS, "--cloud");
  const storage = parseChoice(options.storage, STORAGE_OPTIONS, "--storage")
    ?? (environment === "vps" ? "seaweedfs" : "skip");

  return {
    projectName: options.name,
    framework,
    environment,
    storage,
    cloudProvider: cloudProvider ?? (environment === "cloud" ? "vercel" : undefined),
    includeExamples: options.examples ?? true,
    initGit: options.git ?? true,
    startNow: Boolean(options.start) && environment === "local",
  };
}

export async function promptInteractive(): Promise<PromptAnswers> {
  const osMap: Record<string, string> = {
    darwin: "macOS",
    win32: "Windows",
    linux: "Linux",
  };
  const osLabel = osMap[process.platform] ?? process.platform;

  const projectName = await promptText("Project name", {
    placeholder: "my-site",
    defaultValue: "my-site",
    validate: (value) => value && value.trim().length > 0 ? undefined : "Project name is required",
  });

  const framework = await promptSelect<Framework>("Website framework", [
    { value: "next", label: "Next.js", hint: "App Router website with SSR support." },
  ]);

  const environment = await promptSelect<Environment>("Where are you setting up?", [
    { value: "local", label: `Local machine (${osLabel})`, hint: "Best for trying Vitrea locally with Docker." },
    { value: "vps", label: "VPS / Server - Docker Compose", hint: "Self-host everything with Docker Compose." },
    { value: "cloud", label: "Cloud - Vercel, Railway, Fly.io", hint: "Generate a cloud-friendly starter setup." },
  ]);

  let storage: StorageOption = "skip";
  let cloudProvider: CloudProvider | undefined;

  if (environment === "vps") {
    storage = await promptSelect<StorageOption>("File storage", [
      { value: "seaweedfs", label: "SeaweedFS (self-hosted)", hint: "Run an S3-compatible service yourself." },
      { value: "s3", label: "External S3", hint: "Use AWS S3 or another compatible provider." },
      { value: "skip", label: "Skip", hint: "Configure storage later." },
    ]);
  } else if (environment === "cloud") {
    cloudProvider = await promptSelect<CloudProvider>("Cloud provider", [
      { value: "vercel", label: "Vercel + Neon", hint: "Editor on Vercel with a managed Postgres database." },
      { value: "railway", label: "Railway", hint: "Deploy the app and database together on Railway." },
      { value: "fly", label: "Fly.io", hint: "Deploy on Fly with your own Postgres setup." },
    ]);
    storage = "s3";
  }

  const includeExamples = await promptConfirm("Include example components?", true);
  const initGit = await promptConfirm("Initialize git?", true);
  const startNow = environment === "local"
    ? await promptConfirm("Run setup after creation?", true)
    : false;

  return {
    projectName,
    framework,
    environment,
    storage,
    cloudProvider,
    includeExamples,
    initGit,
    startNow,
  };
}
