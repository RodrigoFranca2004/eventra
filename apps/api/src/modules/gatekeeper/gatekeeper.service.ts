import { prisma } from '../../lib/prisma.js';

export async function validateTicket(
  code: string,
  eventId: string,
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      code,
    },
    select: {
      id: true,
      status: true,
      seat: {
        select: {
          row: true,
          number: true,
        },
      },
      reservation: {
        select: {
          eventId: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    return {
      valid: false,
      reason: 'INVALID',
    } as const;
  }

  if (ticket.reservation.eventId !== eventId) {
    return {
      valid: false,
      reason: 'WRONG_EVENT',
    } as const;
  }

  if (ticket.status === 'USED') {
    return {
      valid: false,
      reason: 'ALREADY_USED',
    } as const;
  }

  if (ticket.status !== 'ACTIVE') {
    return {
      valid: false,
      reason: 'INVALID',
    } as const;
  }

  const updatedTicket = await prisma.ticket.updateMany({
    where: {
      id: ticket.id,
      status: 'ACTIVE',
    },
    data: {
      status: 'USED',
    },
  });

  if (updatedTicket.count === 0) {
    return {
      valid: false,
      reason: 'ALREADY_USED',
    } as const;
  }

  return {
    valid: true,
    ticket: {
      id: ticket.id,
      event: ticket.reservation.event.title,
      seat: ticket.seat,
    },
  } as const;
}