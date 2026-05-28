# Coolify Deployment Guide

Step-by-step guide to deploying Hi Editor on [Coolify](https://coolify.io).

## Prerequisites

- A Coolify v4 instance running on a VPS or dedicated server
- A domain name pointing to your Coolify server
- PostgreSQL knowledge (or use the built-in Coolify database)

## Step 1: Create a New Project

1. Open your Coolify dashboard
2. Navigate to your desired project
3. Click **+ New Resource**
4. Select **Docker Compose**

## Step 2: Add the Compose File

Copy the contents of `deploy/docker-compose.coolify.yml` into the compose editor.

## Step 3: Configure Environment Variables

Set these variables in the Coolify environment editor:

### Required

| Variable | Example | How to get it |
|----------|---------|---------------|
| `BETTER_AUTH_SECRET` | `a1b2c3d4e5f6...` | Run `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | `https://editor.yourdomain.com` | Your Coolify domain |
| `SERVICE_FQDN_EDITOR` | `https://editor.yourdomain.com` | Coolify auto-fills this |

### Auto-configured by Coolify

| Variable | Notes |
|----------|-------|
| `SERVICE_FQDN_EDITOR` | Coolify assigns this from your domain settings |
| `POSTGRES_USER` | Default: `hi` |
| `POSTGRES_PASSWORD` | Change from default |
| `POSTGRES_DB` | Default: `hi` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `S3_ENDPOINT` | `http://seaweedfs:8333` | Use external S3 if preferred |
| `S3_ACCESS_KEY` | `admin` | Change for production |
| `S3_SECRET_KEY` | `secret` | Change for production |

## Step 4: Deploy

Click **Deploy**. Coolify will:
1. Pull the `denoland/deno:2-alpine` base image
2. Build the editor app
3. Start PostgreSQL, SeaweedFS, and the editor

## Step 5: Initialize the Database

After the first deployment, open a terminal in the editor container:

```bash
deno task db:push
deno task db:seed
```

Copy the `WEBSITE_ID` from the seed output and add it to your environment variables.

## Step 6: Add the Website Renderer (Optional)

If you want the public-facing website renderer:

1. Configure `SERVICE_FQDN_WEB` with your website domain
2. Set `WEBSITE_ID` to the ID from step 5
3. Deploy

## Using Nixpacks (Alternative)

Coolify also supports auto-detection via Nixpacks. The `deploy/nixpacks.toml` file configures:

- Deno installation
- Build command: `deno task build:editor`
- Start command: `deno run -A --env apps/editor/server.ts`

To use this method, select **Nixpacks** as the build pack instead of Docker Compose.

## Troubleshooting

### Database connection refused
- Make sure the `postgres` service is healthy before the editor starts
- Check that `DATABASE_URL` uses the service name `postgres` (not `localhost`)

### Auth not working
- Verify `BETTER_AUTH_URL` matches your actual domain (including `https://`)
- `BETTER_AUTH_SECRET` must be set and consistent

### File uploads failing
- Check SeaweedFS is running: `docker compose logs seaweedfs`
- Verify S3 credentials match between editor and SeaweedFS config
- For external S3, ensure `S3_FORCE_PATH_STYLE` is correct (false for AWS, true for MinIO/SeaweedFS)
