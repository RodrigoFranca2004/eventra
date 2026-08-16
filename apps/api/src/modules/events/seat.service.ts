import { prisma } from '../../lib/prisma.js';

export async function listEventSeats(eventId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      status: 'PUBLISHED',
      deletedAt: null,
    },
  });

  if (!event) {
    return null;
  }

  const seats = await prisma.seat.findMany({
    where: {
      eventId,
    },
    include: {
      tickets: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: [
      {
        row: 'asc',
      },
      {
        number: 'asc',
      },
    ],
  });

  return seats.map((seat) => ({
    id: seat.id,
    row: seat.row,
    number: seat.number,
    type: seat.type,
    available: seat.tickets.length === 0,
  }));
}

export async function createEventSeats(
  eventId: string,
  organizerId: string,
  rows: Array<{
    name: string;
    seats: number;
    type: 'STANDARD' | 'PREMIUM' | 'ACCESSIBLE';
  }>,
) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId,
      deletedAt: null,
    },
  });

  if (!event) {
    return null;
  }

  const data = rows.flatMap((row) =>
    Array.from({ length: row.seats }, (_, index) => ({
      eventId,
      row: row.name,
      number: index + 1,
      type: row.type,
    })),
  );

  await prisma.seat.createMany({
    data,
  });

  return prisma.seat.findMany({
    where: {
      eventId,
    },
    orderBy: [
      {
        row: 'asc',
      },
      {
        number: 'asc',
      },
    ],
  });
}