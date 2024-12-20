FROM node:22-bullseye AS builder
WORKDIR /app
ADD ./server/ ./
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

FROM node:22
WORKDIR /app
COPY --chown=node:node --from=builder /app ./
CMD ["npm", "start"]
EXPOSE 8080
