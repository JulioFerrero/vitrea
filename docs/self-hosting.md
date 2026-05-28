# Self-Hosting Guide

## Option 1: Docker Compose (Recommended)

### Prerequisites

- Docker and Docker Compose
- A server with at least 1GB RAM

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/anomalyco/web-builder.git hi-editor
   cd hi-editor
   ```

2. Create your environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and set these **required** variables:
   ```
   DATABASE_URL=postgresql://hi:your-secure-password@postgres:5432/hi
   BETTER_AUTH_SECRET=a-random-32-character-secret
   BETTER_AUTH_URL=https://your-domain.com
   ```

4. Start the services:
   ```bash
   docker compose -f deploy/docker-compose.yml up -d
   ```

5. Initialize the database:
   ```bash
   docker compose -f deploy/docker-compose.yml exec editor deno task db:push
   docker compose -f deploy/docker-compose.yml exec editor deno task db:seed
   ```

6. The seed script prints a `WEBSITE_ID`. Add it to your `.env`:
   ```
   WEBSITE_ID=<the-id-from-seed>
   ```

7. Restart the web service (if using it):
   ```bash
   docker compose -f deploy/docker-compose.yml --profile web up -d
   ```

### Services

| Service | Port | Description |
|---------|------|-------------|
| Editor | 3000 (→ 5173) | Visual editor UI + API |
| Web | 8000 | Published website renderer |
| PostgreSQL | 5432 (internal) | Database |
| SeaweedFS | 8333 (internal) | S3-compatible file storage |

### With Website Renderer

The web service is opt-in (behind a Docker profile). To include it:

```bash
docker compose -f deploy/docker-compose.yml --profile web up -d
```

### Using External S3

If you prefer AWS S3, Cloudflare R2, or MinIO instead of SeaweedFS, set:

```env
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=auto
S3_BUCKET=hi-editor-assets
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_FORCE_PATH_STYLE=false
```

Then remove the `seaweedfs` service from the compose file and the `seaweedfs` dependency from `editor`.

---

## Option 2: Coolify

### Prerequisites

- A Coolify instance (v4.0+)
- A server connected to Coolify

### Steps

1. In Coolify, go to your project → **New Resource** → **Docker Compose**

2. Paste the contents of `deploy/docker-compose.coolify.yml`

3. Configure environment variables:
   - `SERVICE_FQDN_EDITOR` — Coolify auto-sets this to your domain
   - `BETTER_AUTH_SECRET` — generate a random secret
   - `BETTER_AUTH_URL` — set to `https://` + your Coolify domain
   - `POSTGRES_PASSWORD` — a secure password

4. Deploy

5. After deployment, initialize the database:
   ```bash
   deno task db:push
   deno task db:seed
   ```

6. Set `WEBSITE_ID` in the environment and redeploy the web service

### Coolify Service Template

To add Hi Editor to your Coolify's service templates, submit the `deploy/coolify.json` file to the Coolify templates repository.

---

## Option 3: Manual / Bare Metal

### Prerequisites

- Deno 2+
- PostgreSQL 16+
- (Optional) S3-compatible storage

### Steps

1. Install Deno:
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. Clone and build:
   ```bash
   git clone https://github.com/anomalyco/web-builder.git hi-editor
   cd hi-editor
   deno install
   deno task build:editor
   ```

3. Set up PostgreSQL and create a database

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL, auth secret, etc.
   ```

5. Initialize the database:
   ```bash
   deno task db:push
   deno task db:seed
   ```

6. Run the editor server:
   ```bash
   deno task -c apps/editor/deno.json start
   ```

7. (Optional) Build and run the website renderer:
   ```bash
   deno task build:web
   deno task -c apps/web/deno.json start
   ```

### Running as a Systemd Service

Create `/etc/systemd/system/hi-editor.service`:

```ini
[Unit]
Description=Hi Editor
After=network.target postgresql.service

[Service]
Type=simple
User=hi-editor
WorkingDirectory=/opt/hi-editor
EnvironmentFile=/opt/hi-editor/.env
ExecStart=/home/hi-editor/.deno/bin/deno run -A apps/editor/server.ts
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable hi-editor
sudo systemctl start hi-editor
```

---

## Environment Variables Reference

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | — | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | — | Yes | Secret key for auth (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | — | Yes | Public URL of the editor (used for auth callbacks) |
| `WEBSITE_ID` | — | Web app | ID of the website to render |
| `PORT` | `5173` | No | Editor server port |
| `S3_ENDPOINT` | — | No | S3-compatible storage endpoint |
| `S3_REGION` | `us-east-1` | No | S3 region |
| `S3_BUCKET` | `images` | No | S3 bucket name |
| `S3_ACCESS_KEY` | — | No | S3 access key |
| `S3_SECRET_KEY` | — | No | S3 secret key |
| `S3_FORCE_PATH_STYLE` | `true` | No | Use path-style S3 URLs |
| `ASSET_BASE_URL` | — | No | Override URL prefix for assets |

## Backups

### Database

```bash
docker compose exec postgres pg_dump -U hi hi > backup.sql
```

### Restore

```bash
cat backup.sql | docker compose exec -T postgres psql -U hi hi
```

## Upgrading

```bash
git pull
docker compose -f deploy/docker-compose.yml build
docker compose -f deploy/docker-compose.yml up -d
```
