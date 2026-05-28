# Getting Started with `@hi/create`

Create a new Hi Editor project in seconds:

```bash
deno run -A jsr:@hi/create
```

Or with npx:

```bash
npx create-hi-editor
```

## Interactive Prompts

The scaffolder will ask you:

1. **Project name** — directory name for your project (default: `my-site`)
2. **Deployment target** — Docker Compose, Coolify, or Manual
3. **File storage** — SeaweedFS (self-hosted S3), External S3, or Skip
4. **Include example components** — Hero, Features, Footer (default: Yes)
5. **Initialize git** — (default: Yes)

## Generated Project

```
my-site/
├── hi.config.ts          # Site configuration
├── deno.json             # Tasks: dev, build, start, db:push, db:seed
├── .env                  # Environment variables
├── .gitignore
├── components/           # Your custom components
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   └── footer.tsx
└── deploy/               # (if Docker/Coolify selected)
    ├── docker-compose.yml
    ├── seaweedfs/s3.json
    └── docker-compose.coolify.yml  # (if Coolify selected)
```

## Next Steps

```bash
cd my-site

# Edit .env with your database URL and auth secret
# Then start developing
deno task dev
```
