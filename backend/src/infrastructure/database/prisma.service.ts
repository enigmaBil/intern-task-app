import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as Pg from 'pg';


@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public client: PrismaClient;
  private pool: Pg.Pool;

  constructor(private configService: ConfigService) {
    const pool = new Pg.Pool({
        connectionString: this.configService.get<string>('DATABASE_URL'),
        max: parseInt(this.configService.get<string>('DB_POOL_MAX') || '10', 10),
        min: parseInt(this.configService.get<string>('DB_POOL_MIN') || '2', 10),
        idleTimeoutMillis: parseInt(this.configService.get<string>('DB_POOL_IDLE_TIMEOUT') || '30000', 10),
        connectionTimeoutMillis: parseInt(this.configService.get<string>('DB_CONNECTION_TIMEOUT') || '2000', 10),
    });

    const adapter = new PrismaPg(pool);

    this.client = new PrismaClient({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Log queries in development
    if (process.env.NODE_ENV !== 'production') {
      this.client.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    this.client.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });

    this.client.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });
  }

  /**
   * Expose all Prisma models through getters
   */
  get user() {
    return this.client.user;
  }

  get task() {
    return this.client.task;
  }

  get scrumNote() {
    return this.client.scrumNote;
  }

  /**
   * Connect to database when module initializes
   */
  async onModuleInit() {
    try {
      await this.client.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   */
  async onModuleDestroy() {
    try {
      await this.client.$disconnect();
      // Close the PostgreSQL pool
      await this.pool.end();
      this.logger.log('Successfully disconnected from the database');
    } catch (error) {
      this.logger.error('Failed to disconnect from the database', error);
    }
  }

  /**
   * Enable shutdown hooks for graceful shutdown
   */
  async enableShutdownHooks(app: any) {
    this.client.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }

  /**
   * Clean all data from database (useful for testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Delete in correct order to respect foreign key constraints
    await this.client.scrumNote.deleteMany();
    await this.client.task.deleteMany();
    await this.client.user.deleteMany();

    this.logger.log('Database cleaned successfully');
  }
}
