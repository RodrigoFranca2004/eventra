import { prisma } from '../../lib/prisma.js';
import type {
  CreateEventInput,
  UpdateEventInput,
} from './event.schemas.js';

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

export async function publishEvent(id: string, organizerId: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return null;
  }

  if (event.organizerId !== organizerId) {
    return 'FORBIDDEN';
  }

  if (event.status !== 'DRAFT') {
    return 'INVALID_STATUS';
  }

  return prisma.event.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
    },
  });
}

export async function cancelEvent(id: string, organizerId: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return null;
  }

  if (event.organizerId !== organizerId) {
    return 'FORBIDDEN';
  }

  if (event.status === 'CANCELLED') {
    return 'INVALID_STATUS';
  }

  return prisma.event.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });
}

export async function updateEvent(
  id: string,
  organizerId: string,
  data: UpdateEventInput,
) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return null;
  }

  if (event.organizerId !== organizerId) {
    return 'FORBIDDEN';
  }

  if (event.status === 'CANCELLED') {
    return 'INVALID_STATUS';
  }

  return prisma.event.update({
    where: { id },
    data,
  });
}