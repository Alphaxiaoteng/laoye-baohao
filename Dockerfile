# ---- 构建阶段 ----
FROM node:20-slim AS build

WORKDIR /app
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM node:20-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7860

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/content ./content
COPY --from=build /app/server ./server
COPY --from=build /app/src/types ./src/types
COPY --from=build /app/tsconfig.json ./tsconfig.json

# 密钥只通过运行时环境变量注入，镜像里不写任何密钥
EXPOSE 7860

CMD ["node", "--import", "tsx", "server/index.ts"]
