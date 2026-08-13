import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  TaskPriority,
  TaskStatus,
} from '../src/generated/prisma/client';

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the Prisma seed.');
  }

  return databaseUrl;
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({ adapter });

const seedTasks = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Write API Documentation',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    assigneeName: 'Dexter',
    assigneeInitials: 'D',
    dueDate: new Date('2026-09-12T00:00:00.000Z'),
    labels: ['API', 'Docs'],
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    title: 'Implement Search Function',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigneeName: 'CN',
    assigneeInitials: 'CN',
    dueDate: new Date('2026-09-13T00:00:00.000Z'),
    labels: ['Search', 'UX'],
  },
  {
    id: '11111111-1111-4111-8111-111111111113',
    title: 'Deploy to Production',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    assigneeName: null,
    assigneeInitials: null,
    dueDate: new Date('2026-09-14T00:00:00.000Z'),
    labels: ['Release'],
  },
  {
    id: '11111111-1111-4111-8111-111111111114',
    title: 'Code Review Completed',
    status: TaskStatus.DOING,
    priority: TaskPriority.MEDIUM,
    assigneeName: 'Dexter',
    assigneeInitials: 'D',
    dueDate: new Date('2026-09-15T00:00:00.000Z'),
    labels: ['Code Review'],
  },
  {
    id: '11111111-1111-4111-8111-111111111115',
    title: 'Design Mockups Finalized',
    status: TaskStatus.DOING,
    priority: TaskPriority.HIGH,
    assigneeName: 'CN',
    assigneeInitials: 'CN',
    dueDate: new Date('2026-09-16T00:00:00.000Z'),
    labels: ['Design', 'UI'],
  },
  {
    id: '11111111-1111-4111-8111-111111111116',
    title: 'Feature Testing Passed',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    assigneeName: 'Dexter',
    assigneeInitials: 'D',
    dueDate: new Date('2026-09-17T00:00:00.000Z'),
    labels: ['Testing'],
  },
  {
    id: '11111111-1111-4111-8111-111111111117',
    title: 'UI Design Updated',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    assigneeName: 'CN',
    assigneeInitials: 'CN',
    dueDate: new Date('2026-09-18T00:00:00.000Z'),
    labels: ['UI'],
  },
  {
    id: '11111111-1111-4111-8111-111111111118',
    title: 'Security Audit Scheduled',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    assigneeName: null,
    assigneeInitials: null,
    dueDate: new Date('2026-09-19T00:00:00.000Z'),
    labels: ['Security'],
  },
  {
    id: '11111111-1111-4111-8111-111111111119',
    title: 'UI Review',
    status: TaskStatus.ON_HOLD,
    priority: TaskPriority.LOW,
    assigneeName: 'Dexter',
    assigneeInitials: 'D',
    dueDate: new Date('2026-09-20T00:00:00.000Z'),
    labels: ['Review'],
  },
  {
    id: '11111111-1111-4111-8111-111111111120',
    title: 'Backend Integration',
    status: TaskStatus.ON_HOLD,
    priority: TaskPriority.MEDIUM,
    assigneeName: 'CN',
    assigneeInitials: 'CN',
    dueDate: new Date('2026-09-21T00:00:00.000Z'),
    labels: ['Backend'],
  },
  {
    id: '11111111-1111-4111-8111-111111111121',
    title: 'User Feedback',
    status: TaskStatus.ON_HOLD,
    priority: TaskPriority.LOW,
    assigneeName: null,
    assigneeInitials: null,
    dueDate: new Date('2026-09-22T00:00:00.000Z'),
    labels: ['Research'],
  },
  {
    id: '11111111-1111-4111-8111-111111111122',
    title: 'Performance Optimization',
    status: TaskStatus.ON_HOLD,
    priority: TaskPriority.MEDIUM,
    assigneeName: 'Dexter',
    assigneeInitials: 'D',
    dueDate: new Date('2026-09-23T00:00:00.000Z'),
    labels: ['Performance'],
  },
] as const;

async function main(): Promise<void> {
  await prisma.$transaction(
    seedTasks.map((task) =>
      prisma.task.upsert({
        where: {
          id: task.id,
        },
        update: {
          title: task.title,
          status: task.status,
          priority: task.priority,
          assigneeName: task.assigneeName,
          assigneeInitials: task.assigneeInitials,
          dueDate: task.dueDate,
          labels: [...task.labels],
        },
        create: {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          assigneeName: task.assigneeName,
          assigneeInitials: task.assigneeInitials,
          dueDate: task.dueDate,
          labels: [...task.labels],
        },
      }),
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
