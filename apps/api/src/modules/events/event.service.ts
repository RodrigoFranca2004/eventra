import { prisma } from '../../lib/prisma.js';
import type { CreateEventInput } from './event.schemas.js';

export async function createEvent(
  organizerId: string,
  data: CreateEventInput,
) {
  return prisma.event.create({
    data: {
      organizerId,
      title: data.title,
      description: data.description,
      type: data.type,
      externalId: data.externalId,
      date: data.date,
      location: data.location,
      capacity: data.capacity,
      price: data.price,
    },
  });
}

export async function listEvents(filters: {
  type?: 'MOVIE' | 'SHOW';
  search?: string;
}) {
  return prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      ...(filters.type && { type: filters.type }),
      ...(filters.search && {
        title: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }),
    },
    orderBy: {
      date: 'asc',
    },
  });
}

export async function getPublishedEventById(id: string) {
  return prisma.event.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
    },
  });
}