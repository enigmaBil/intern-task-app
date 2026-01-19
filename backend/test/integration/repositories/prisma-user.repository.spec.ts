import { UserRole } from "@/core/domain/enums/user-role.enum";
import { PrismaService } from "@/infrastructure/database";
import { PrismaUserRepository } from "@/infrastructure/database/repositories"
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

describe('PrismaUserRepository (Integration)', () => {
    let repository: PrismaUserRepository;
    let prisma: PrismaService;
    let module: TestingModule;

    let testUserIds: string[] = [];

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [PrismaService, PrismaUserRepository],
        }).compile();

        prisma = module.get<PrismaService>(PrismaService);
        repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    });

    afterEach(async () => {
        if (testUserIds.length > 0) {
            await prisma.client.user.deleteMany({
                where: {
                    id: {
                        in: testUserIds,
                    },
                },
            });
            testUserIds = [];
        }
    });

    afterAll(async () => {
        await prisma.client.$disconnect();
        await module.close();
    });

    describe('findById', () => {
        it('should find a user by id', async () => {
            // Arrange
            const prismaUser = await prisma.client.user.create({
                data: {
                    email: 'test@example.com',
                    firstName: 'Test User',
                    lastName: 'Userton',
                    role: UserRole.ADMIN,
                },
            });
            testUserIds.push(prismaUser.id);

            // Act
            const user = await repository.findById(prismaUser.id);

            // Assert
            expect(user).toBeDefined();
            expect(user?.id).toBe(prismaUser.id);
            expect(user?.email).toBe('test@example.com');
            expect(user?.role).toBe(UserRole.ADMIN);
        });

        it('should return null when user does not exist', async () => {
            // Act
            const user = await repository.findById('non-existent-id');

            // Assert
            expect(user).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            // Arrange
            const prismaUser = await prisma.client.user.create({
                data: {
                    email: 'findbyemail@example.com',
                    firstName: 'Find By Email',
                    lastName: 'User',
                    role: UserRole.INTERN,
                },
            });
            testUserIds.push(prismaUser.id);

            // Act
            const user = await repository.findByEmail('findbyemail@example.com');

            // Assert
            expect(user).toBeDefined();
            expect(user?.email).toBe('findbyemail@example.com');
            expect(user?.role).toBe(UserRole.INTERN);
        });
    });

    describe('findByRole', () => {
        it('should return users filtered by role', async () => {
            // Arrange
            const admin = await prisma.client.user.create({
                data: {
                    email: 'admin@example.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: UserRole.ADMIN,
                },
            });
            testUserIds.push(admin.id);

            const intern = await prisma.client.user.create({
                data: {
                    email: 'intern@example.com',
                    firstName: 'Intern',
                    lastName: 'User',
                    role: UserRole.INTERN,
                },
            });
            testUserIds.push(intern.id);

            // Act
            const admins = await repository.findByRole(UserRole.ADMIN);
            const interns = await repository.findByRole(UserRole.INTERN);

            // Assert
            expect(admins.some((u) => u.id === admin.id)).toBe(true);
            expect(interns.some((u) => u.id === intern.id)).toBe(true);
        });
    });

    describe('exists and emailExists', () => {
        it('should check if user exists', async () => {
            // Arrange
            const prismaUser = await prisma.client.user.create({
                data: {
                    email: 'exists@example.com',
                    firstName: 'Exists User',
                    lastName: 'Userton',
                    role: UserRole.ADMIN,
                },
            });
            testUserIds.push(prismaUser.id);

            // Act
            const existsById = await repository.exists(prismaUser.id);
            const existsByEmail = await repository.emailExists('exists@example.com');
            const notExists = await repository.exists('non-existent-id');

            // Assert
            expect(existsById).toBe(true);
            expect(existsByEmail).toBe(true);
            expect(notExists).toBe(false);
        });
    });
});
