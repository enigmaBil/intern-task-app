import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * DatabaseModule provides database access throughout the application
 * Marked as @Global to make PrismaService available everywhere without importing
 * This follows the infrastructure layer pattern in Clean Architecture
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
