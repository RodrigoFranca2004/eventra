import { prisma } from '../../lib/prisma.js';
import type {
  CreateEventInput,
  UpdateEventInput,
} from './event.schemas.js';
import { getMovieById } from '../catalog/tmdb.service.js';
import type { Event } from '@prisma/client';

async function enrichEvent(event: Event) {
  if (event.type !== 'MOVIE' || !event.externalId) {
    return {
      ...event,
      imageUrl: null,
    };
  }

  const movie = await getMovieById(event.externalId);

  return {
    ...event,
    imageUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
  };
}

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
      price: data.price,
    },
  });
}

export async function listEvents(filters: {
    type?: 'MOVIE' | 'SHOW';
    search?: string;
  }) {
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
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

    return Promise.all(events.map(enrichEvent));
}

export async function getPublishedEventById(id: string) {
  const event = await prisma.event.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
      deletedAt: null,
    },
  });

  if (!event) {
    return null;
  }

  return enrichEvent(event);
}

export async function publishEvent(id: string, organizerId: string) {
  const event = await prisma.event.findFirst({
  where: {
    id,
    deletedAt: null,
  },
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
  const event = await prisma.event.findFirst({
  where: {
    id,
    deletedAt: null,
  },
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
  const event = await prisma.event.findFirst({
  where: {
    id,
    deletedAt: null,
  },
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

export async function deleteEvent(id: string, organizerId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!event) {
    return null;
  }

  if (event.organizerId !== organizerId) {
    return 'FORBIDDEN';
  }

  await prisma.event.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return true;
}