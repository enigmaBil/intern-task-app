import { defineConfig } from 'prisma/config';
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

console.log(resolve(__dirname, "../../.env"));


export default defineConfig({
  schema: "../database/prisma/schema.prisma",
  migrations: {
    path: "../database/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});