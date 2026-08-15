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