import { prisma } from '../../lib/prisma.js';

export async function listUserTickets(userId: string) {
  return prisma.ticket.findMany({
    where: {
      reservation: {
        userId,
      },
      status: 'ACTIVE',
    },
    select: {
      id: true,
      code: true,
      status: true,
      createdAt: true,
      seat: {
        select: {
          id: true,
          row: true,
          number: true,
          type: true,
        },
      },
      reservation: {
        select: {
          id: true,
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getUserTicket(
  ticketId: string,
  userId: string,
) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      reservation: {
        userId,
      },
    },
    select: {
      id: true,
      code: true,
      status: true,
      createdAt: true,
      seat: {
        select: {
          id: true,
          row: true,
          number: true,
          type: true,
        },
      },
      reservation: {
        select: {
          id: true,
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              price: true,
            },
          },
        },
      },
    },
  });
}

export async function getSharedTicket(code: string) {
  return prisma.ticket.findFirst({
    where: {
      code,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      status: true,
      seat: {
        select: {
          row: true,
          number: true,
          type: true,
        },
      },
      reservation: {
        select: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
        },
      },
    },
  });
}

export async function getTicketShareLink(
  ticketId: string,
  userId: string,
) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      reservation: {
        userId,
      },
      status: 'ACTIVE',
    },
    select: {
      code: true,
    },
  });

  if (!ticket) {
    return null;
  }

  return {
    url: `/tickets/share/${ticket.code}`,
  };
}