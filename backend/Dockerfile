```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source
COPY src ./src

# Build application
RUN npm run build

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
```
