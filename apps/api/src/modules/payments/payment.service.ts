import { prisma } from '../../lib/prisma.js';

export async function processPayment(
  reservationId: string,
  userId: string,
  approved: boolean,
) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      userId,
      status: 'PENDING',
    },
  });

  if (!reservation) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (!approved) {
      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: 'PAYMENT_FAILED',
        },
      });

      await tx.ticket.updateMany({
        where: {
          reservationId: reservation.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      return {
        status: 'PAYMENT_FAILED' as const,
      };
    }

    await tx.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: 'CONFIRMED',
      },
    });

    return {
      status: 'CONFIRMED' as const,
    };
  });
}