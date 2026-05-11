const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const memberPassword = await bcrypt.hash('member123', salt);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Members
  const member1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const member3 = await prisma.user.create({
    data: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and better UX.',
      createdBy: admin.id,
      members: {
        connect: [{ id: member1.id }, { id: member2.id }],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile app for iOS and Android.',
      createdBy: admin.id,
      members: {
        connect: [{ id: member2.id }, { id: member3.id }],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'Q3 Marketing Campaign',
      description: 'Plan and execute the Q3 digital marketing campaign across all channels.',
      createdBy: admin.id,
      members: {
        connect: [{ id: member1.id }, { id: member3.id }],
      },
    },
  });

  // Create Tasks for Project 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the homepage.',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: new Date('2025-12-01'),
        projectId: project1.id,
        createdBy: admin.id,
        assignedTo: member1.id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a mobile-first responsive navigation menu.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-06-15'),
        projectId: project1.id,
        createdBy: admin.id,
        assignedTo: member2.id,
      },
      {
        title: 'SEO optimization audit',
        description: 'Audit current SEO performance and implement improvements.',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: new Date('2026-07-01'),
        projectId: project1.id,
        createdBy: admin.id,
        assignedTo: member1.id,
      },
      {
        title: 'Performance optimization',
        description: 'Improve page load times to under 2 seconds.',
        priority: 'LOW',
        status: 'TODO',
        dueDate: new Date('2026-07-20'),
        projectId: project1.id,
        createdBy: admin.id,
        assignedTo: member2.id,
      },
    ],
  });

  // Create Tasks for Project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup React Native project',
        description: 'Initialize the React Native project with required dependencies.',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: new Date('2025-11-20'),
        projectId: project2.id,
        createdBy: admin.id,
        assignedTo: member2.id,
      },
      {
        title: 'Implement user authentication',
        description: 'Build login/signup screens with JWT auth.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-06-10'),
        projectId: project2.id,
        createdBy: admin.id,
        assignedTo: member3.id,
      },
      {
        title: 'Design app UI kit',
        description: 'Create a consistent design system and component library.',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: new Date('2026-06-05'),
        projectId: project2.id,
        createdBy: admin.id,
        assignedTo: member2.id,
      },
    ],
  });

  // Create Tasks for Project 3 (some overdue)
  await prisma.task.createMany({
    data: [
      {
        title: 'Content calendar planning',
        description: 'Plan all social media and blog content for Q3.',
        priority: 'HIGH',
        status: 'TODO',
        dueDate: new Date('2026-04-30'),
        projectId: project3.id,
        createdBy: admin.id,
        assignedTo: member1.id,
      },
      {
        title: 'Email campaign setup',
        description: 'Configure and schedule the email drip campaign.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-05-01'),
        projectId: project3.id,
        createdBy: admin.id,
        assignedTo: member3.id,
      },
      {
        title: 'Ad creative production',
        description: 'Produce banner ads and video content for paid campaigns.',
        priority: 'HIGH',
        status: 'TODO',
        dueDate: new Date('2026-06-30'),
        projectId: project3.id,
        createdBy: admin.id,
        assignedTo: member1.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  ADMIN  → admin@example.com / admin123');
  console.log('  MEMBER → sarah@example.com / member123');
  console.log('  MEMBER → john@example.com  / member123');
  console.log('  MEMBER → emily@example.com / member123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
