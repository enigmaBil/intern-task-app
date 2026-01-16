import { PrismaClient } from '@/infrastructure/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.scrumNote.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleaned existing data');

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@minijira.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const intern1 = await prisma.user.create({
    data: {
      email: 'intern1@minijira.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'INTERN',
      isActive: true,
    },
  });

  const intern2 = await prisma.user.create({
    data: {
      email: 'intern2@minijira.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'INTERN',
      isActive: true,
    },
  });

  const intern3 = await prisma.user.create({
    data: {
      email: 'intern3@minijira.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      role: 'INTERN',
      isActive: true,
    },
  });

  console.log('✅ Created users');

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup project structure',
      description: 'Initialize the project with clean architecture',
      status: 'DONE',
      estimatedHours: 8,
      actualHours: 6,
      createdById: admin.id,
      assigneeId: intern1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Setup Keycloak integration',
      status: 'IN_PROGRESS',
      estimatedHours: 16,
      actualHours: 10,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdById: admin.id,
      assigneeId: intern2.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Create task management API',
      description: 'REST API for CRUD operations on tasks',
      status: 'TODO',
      estimatedHours: 12,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdById: admin.id,
      assigneeId: intern3.id,
    },
  });

  console.log('✅ Created tasks');

  // Create scrum notes
  await prisma.scrumNote.create({
    data: {
      date: new Date(),
      whatIDid: 'Completed project setup and initial configuration',
      whatIWillDo: 'Start working on authentication module',
      blockers: null,
      userId: intern1.id,
      taskId: task1.id,
    },
  });

  await prisma.scrumNote.create({
    data: {
      date: new Date(),
      whatIDid: 'Reviewed authentication requirements',
      whatIWillDo: 'Design the API endpoints for task management',
      blockers: 'Waiting for Keycloak setup documentation',
      userId: intern3.id,
      taskId: task3.id,
    },
  });

  console.log('✅ Created scrum notes');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
