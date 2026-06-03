import type { PromptAnswers } from "../prompts.ts";

export function dockerComposeFull(answers: PromptAnswers): string {
  const s3Service = answers.storage === "seaweedfs" ? `
  seaweedfs:
    image: chrislusf/seaweedfs
    restart: unless-stopped
    command: server -s3 -s3.config=/config/s3.json -dir=/data -ip.bind=0.0.0.0
    volumes:
      - seaweed_data:/data
      - ./seaweedfs/s3.json:/config/s3.json
    networks:
      - internal
` : "";

  const s3Env = answers.storage === "seaweedfs" ? `
      S3_ENDPOINT: http://seaweedfs:8333
      S3_REGION: us-east-1
      S3_BUCKET: images
      S3_ACCESS_KEY: admin
      S3_SECRET_KEY: secret
      S3_FORCE_PATH_STYLE: "true"` : "";

  const s3Dep = answers.storage === "seaweedfs" ? `
      seaweedfs:
        condition: service_started` : "";

  const s3Vol = answers.storage === "seaweedfs" ? `  seaweed_data:\n` : "";

  return `services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-hi}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-hi}
      POSTGRES_DB: \${POSTGRES_DB:-${answers.projectName}}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-hi} -d \${POSTGRES_DB:-${answers.projectName}}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - internal
${s3Service}
  editor:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "\${EDITOR_PORT:-3000}:5173"
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER:-hi}:\${POSTGRES_PASSWORD:-hi}@postgres:5432/\${POSTGRES_DB:-${answers.projectName}}${s3Env}
      ASSET_BASE_URL: \${ASSET_BASE_URL:-}
      BETTER_AUTH_SECRET: \${BETTER_AUTH_SECRET:-}
      BETTER_AUTH_URL: \${BETTER_AUTH_URL:-}
    depends_on:
      postgres:
        condition: service_healthy${s3Dep}
    networks:
      - internal

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    restart: unless-stopped
    ports:
      - "\${WEB_PORT:-8000}:8000"
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER:-hi}:\${POSTGRES_PASSWORD:-hi}@postgres:5432/\${POSTGRES_DB:-${answers.projectName}}
      WEBSITE_ID: \${WEBSITE_ID:-}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal

volumes:
  pgdata:
${s3Vol}
networks:
  internal:
`;
}

export function dockerComposeLocal(answers: PromptAnswers): string {
  return `services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: hi
      POSTGRES_PASSWORD: hi
      POSTGRES_DB: ${answers.projectName}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hi -d ${answers.projectName}"]
      interval: 5s
      timeout: 5s
      retries: 5

  seaweedfs:
    image: chrislusf/seaweedfs
    restart: unless-stopped
    command: server -s3 -s3.config=/config/s3.json -dir=/data -ip.bind=0.0.0.0
    ports:
      - "8333:8333"
    volumes:
      - seaweed_data:/data
      - ./seaweedfs/s3.json:/config/s3.json

volumes:
  pgdata:
  seaweed_data:
`;
}

export function seaweedfsConfig(): string {
  return JSON.stringify({
    identities: [
      { name: "admin", credentials: [{ accessKey: "admin", secretKey: "secret" }], actions: ["Admin", "Read", "Write"] },
      { name: "anonymous", actions: ["Read"] },
    ],
  }, null, 2);
}

export function vercelJson(): string {
  return JSON.stringify({
    buildCommand: "deno task build",
    outputDirectory: "apps/web/_fresh",
    installCommand: "deno install",
  }, null, 2);
}

export function flyToml(): string {
  return `app = "hi-editor"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "5173"

[http_service]
  internal_port = 5173
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
`;
}

export function railwayJson(): string {
  return JSON.stringify({
    "$schema": "https://railway.app/railway.schema.json",
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    deploy: { restartPolicyType: "ON_FAILURE" },
  }, null, 2);
}
