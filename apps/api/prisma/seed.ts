import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const PASSWORD = 'eventra123';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const organizer = await prisma.user.upsert({
    where: {
      email: 'organizer@eventra.test',
    },
    update: {},
    create: {
      name: 'Eventra Organizer',
      email: 'organizer@eventra.test',
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'customer1@eventra.test',
    },
    update: {},
    create: {
      name: 'Eventra Customer 1',
      email: 'customer1@eventra.test',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'customer2@eventra.test',
    },
    update: {},
    create: {
      name: 'Eventra Customer 2',
      email: 'customer2@eventra.test',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'gatekeeper@eventra.test',
    },
    update: {},
    create: {
      name: 'Eventra Gatekeeper',
      email: 'gatekeeper@eventra.test',
      passwordHash,
      role: 'GATEKEEPER',
    },
  });

  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: 'Dune: Part Three',
      description:
        'Emperor Paul Atreides faces the fallout from his ascent to power as political plots and a galaxy-wide holy war endanger the future only he can see.',
      type: 'MOVIE',
      externalId: '1170608',
      date: new Date('2026-12-20T19:00:00.000Z'),
      location: 'Eventra Test Cinema',
      price: 15,
      status: 'PUBLISHED',
    },
  });

  const rows = [
    { name: 'A', seats: 8, type: 'STANDARD' as const },
    { name: 'B', seats: 10, type: 'STANDARD' as const },
    { name: 'C', seats: 12, type: 'STANDARD' as const },
    { name: 'D', seats: 14, type: 'PREMIUM' as const },
    { name: 'E', seats: 14, type: 'PREMIUM' as const },
    { name: 'F', seats: 12, type: 'PREMIUM' as const },
    { name: 'G', seats: 8, type: 'ACCESSIBLE' as const },
  ];

  await prisma.seat.createMany({
    data: rows.flatMap((row) =>
      Array.from({ length: row.seats }, (_, index) => ({
        eventId: event.id,
        row: row.name,
        number: index + 1,
        type: row.type,
      })),
    ),
  });

  const capacity = rows.reduce(
    (total, row) => total + row.seats,
    0,
  );

  await prisma.event.update({
    where: {
      id: event.id,
    },
    data: {
      capacity,
    },
  });

  console.log('Seed completed successfully.');
  console.log('');
  console.log('Test accounts:');
  console.log('Organizer: organizer@eventra.test');
  console.log('Customer: customer1@eventra.test');
  console.log('Customer: customer2@eventra.test');
  console.log('Gatekeeper: gatekeeper@eventra.test');
  console.log(`Password: ${PASSWORD}`);
  console.log('');
  console.log(`Event: ${event.title}`);
  console.log(`Capacity: ${capacity}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });