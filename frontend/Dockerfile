# STAGE 1: Dependencies

FROM node:22-alpine AS deps
WORKDIR /app

# Installer libc6-compat pour la compatibilité Alpine
RUN apk add --no-cache libc6-compat

# Copier uniquement les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production && \
    npm cache clean --force

# STAGE 2: Builder

FROM node:22-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances pour le build
RUN npm ci

# Copier le code source
COPY . .

# Variables d'environnement nécessaires au build
# Note: Les variables publiques (NEXT_PUBLIC_*) doivent être définies au build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_KEYCLOAK_ISSUER

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_KEYCLOAK_ISSUER=$NEXT_PUBLIC_KEYCLOAK_ISSUER

# Désactiver la télémétrie Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN npm run build

# STAGE 3: Production

FROM node:22-alpine AS production
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Copier le build Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Commande de démarrage
CMD ["node", "server.js"]