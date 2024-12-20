FROM node:22-bullseye AS builder
WORKDIR /app
ADD . .
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

FROM node:22-bullseye-slim
WORKDIR /home/node/app

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

USER node

COPY --from=builder --chown=node /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/server/dist .
COPY --from=builder --chown=node /app/package.json /home/node

CMD ["dumb-init", "node", "index.js"]
EXPOSE 8080
