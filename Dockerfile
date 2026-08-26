# ── Build frontend ────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ── Server runtime ────────────────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --ignore-scripts
COPY server/ .
COPY --from=frontend-build /app/dist /app/dist

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

ENTRYPOINT ["node", "index.js"]
