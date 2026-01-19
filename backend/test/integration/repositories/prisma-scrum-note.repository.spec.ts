import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '@/infrastructure/database';

describe('PrismaScrumNoteRepository (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.client.$disconnect();
    await module.close();
  });

  it('should be defined', () => {
    expect(prisma).toBeDefined();
  });

  // TODO: Implémenter les tests d'intégration pour ScrumNote
});
