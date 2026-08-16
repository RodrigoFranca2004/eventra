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
      ticket: {
        select: {
          status: true,
          reservation: {
            select: {
              status: true,
              createdAt: true,
            },
          },
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

  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);

  return seats.map((seat) => {
    const ticket = seat.ticket;

    const occupied =
      ticket?.status === 'ACTIVE' &&
      ticket.reservation.status !== 'PENDING' ||
      (ticket?.status === 'ACTIVE' &&
        ticket.reservation.status === 'PENDING' &&
        ticket.reservation.createdAt > expirationTime);

    return {
      id: seat.id,
      row: seat.row,
      number: seat.number,
      type: seat.type,
      available: !occupied,
    };
  });
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