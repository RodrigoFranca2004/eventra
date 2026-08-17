import crypto from 'node:crypto';

import { prisma } from '../../lib/prisma.js';

const RESERVATION_EXPIRATION_MINUTES = 10;

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

  const expirationTime = new Date(
    Date.now() - RESERVATION_EXPIRATION_MINUTES * 60 * 1000,
  );

  await prisma.$transaction(async (tx) => {
    const expiredReservations = await tx.reservation.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: expirationTime,
        },
        tickets: {
          some: {
            seatId: {
              in: uniqueSeatIds,
            },
            status: 'ACTIVE',
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (expiredReservations.length === 0) {
      return;
    }

    const reservationIds = expiredReservations.map(
      (reservation) => reservation.id,
    );

    await tx.ticket.updateMany({
      where: {
        reservationId: {
          in: reservationIds,
        },
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    await tx.reservation.updateMany({
      where: {
        id: {
          in: reservationIds,
        },
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });
  });

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
            code: crypto.randomBytes(32).toString('hex'),
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

export async function getReservationById(
  reservationId: string,
  userId: string,
) {
  return prisma.reservation.findFirst({
    where: {
      id: reservationId,
      userId,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
        },
      },
      tickets: {
        select: {
          id: true,
          seatId: true,
          status: true,
          code: true,
        },
      },
    },
  });
}