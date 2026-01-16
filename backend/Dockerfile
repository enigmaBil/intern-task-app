FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client before starting
RUN npm run prisma:generate

EXPOSE 3001

CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start:dev"]