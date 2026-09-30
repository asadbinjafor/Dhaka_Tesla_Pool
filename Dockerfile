FROM node:24.17.0-bookworm-slim@sha256:862263c612aa437e3037674b85419622a9d93bff80aa1eee5398dfe686375532 AS build
WORKDIR /app
RUN npm install --global npm@12.0.2
COPY dhaka-tesla-pool-backend ./dhaka-tesla-pool-backend
RUN npm --prefix dhaka-tesla-pool-backend ci && npm --prefix dhaka-tesla-pool-backend run build
COPY dhaka-tesla-pool-frontend ./dhaka-tesla-pool-frontend
RUN npm --prefix dhaka-tesla-pool-frontend ci && npm --prefix dhaka-tesla-pool-frontend run build
RUN chown -R node:node /app

FROM build AS api
ENV NODE_ENV=production API_HOST=0.0.0.0 API_PORT=3001
USER node
EXPOSE 3001
CMD ["node", "dhaka-tesla-pool-backend/dist/main.js"]

FROM build AS web
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "dhaka-tesla-pool-frontend/node_modules/next/dist/bin/next", "start", "dhaka-tesla-pool-frontend", "--hostname", "0.0.0.0"]
