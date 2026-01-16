import { registerAs } from '@nestjs/config';

/**
 * Database Configuration
 * 
 * Centralized database configuration for the application
 * Used by Prisma and other database-related services
 */
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  
  // Connection pool settings
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  },
  
  // Prisma specific settings
  prisma: {
    logLevel: process.env.PRISMA_LOG_LEVEL || 'info',
    errorFormat: process.env.PRISMA_ERROR_FORMAT || 'pretty',
  },
  
  // Database info
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'mini_jira_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
}));
