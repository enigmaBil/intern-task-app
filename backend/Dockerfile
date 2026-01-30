# STAGE 1: Dependencies

FROM node:22-alpine AS deps
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./
COPY src/infrastructure/database/prisma ./src/infrastructure/database/prisma/
COPY src/infrastructure/config/prisma.config.ts ./src/infrastructure/config/

# Installer uniquement les dépendances de production
RUN npm ci --only=production && \
    npm cache clean --force

# STAGE 2: Build

FROM node:22-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY src/infrastructure/database/prisma ./src/infrastructure/database/prisma/
COPY src/infrastructure/config/prisma.config.ts ./src/infrastructure/config/

# Installer TOUTES les dépendances (dev + prod) pour le build
RUN npm ci

# Copier le code source
COPY . .

# Générer Prisma Client
RUN npm run prisma:generate

# Build l'application NestJS
RUN npm run build

# STAGE 3: Production

FROM node:22-alpine AS production
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copier les dépendances de production depuis le stage deps
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nodejs /app/package*.json ./

# Copier le build depuis le stage builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Passer à l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]