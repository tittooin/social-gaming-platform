# Simple Dockerfile to build and run the backend
FROM node:18-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "app.js"]