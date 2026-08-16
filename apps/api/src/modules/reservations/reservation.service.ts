import crypto from 'node:crypto';

import { prisma } from '../../lib/prisma.js';

export async function createReservation(
  userId: string,
  eventId: string,
  seatIds: string[],
) {
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

  const uniqueSeatIds = [...new Set(seatIds)];

  const seats = await prisma.seat.findMany({
    where: {
      id: {
        in: uniqueSeatIds,
      },
      eventId,
    },
  });

  if (seats.length !== uniqueSeatIds.length) {
    return null;
  }

  const occupiedSeats = await prisma.ticket.findMany({
    where: {
      seatId: {
        in: uniqueSeatIds,
      },
      status: 'ACTIVE',
    },
    select: {
      seatId: true,
    },
  });

  if (occupiedSeats.length > 0) {
    return {
      conflict: true,
      seatIds: occupiedSeats.map((ticket) => ticket.seatId),
    };
  }

  const totalAmount = Number(event.price) * uniqueSeatIds.length;

  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.create({
      data: {
        userId,
        eventId,
        quantity: uniqueSeatIds.length,
        totalAmount,
        status: 'PENDING',
      },
    });

    const tickets = await Promise.all(
      uniqueSeatIds.map((seatId) =>
        tx.ticket.create({
          data: {
            reservationId: reservation.id,
            seatId,
            code: crypto.randomUUID(),
            status: 'ACTIVE',
          },
        }),
      ),
    );

    return {
      reservation,
      tickets,
    };
  });
}