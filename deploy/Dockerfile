FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm build:editor

EXPOSE 3001
ENV PORT=3001

CMD ["pnpm", "--filter", "@app/editor", "start"]
