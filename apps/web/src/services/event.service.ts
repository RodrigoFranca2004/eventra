import { api } from './api.service';
import type { Event } from '../types/event';
import type { Seat } from '../types/seat';

export type CreateEventInput = {
  title: string;
  description?: string;
  type: 'MOVIE' | 'SHOW';
  externalId?: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
};

export type CreateEventSeatsInput = {
  rows: Array<{
    name: string;
    seats: number;
    type: 'STANDARD' | 'PREMIUM' | 'ACCESSIBLE';
  }>;
};

export async function listPublishedEvents(): Promise<Event[]> {
  const response = await api<{ data: Event[] }>('/events');

  return response.data;
}

export async function getEventById(id: string): Promise<Event> {
  const response = await api<{ data: Event }>(`/events/${id}`);

  return response.data;
}

export async function listEventSeats(eventId: string): Promise<Seat[]> {
  const response = await api<{ data: Seat[] }>(
    `/events/${eventId}/seats`,
  );

  return response.data;
}

export async function createEvent(
  data: CreateEventInput,
): Promise<Event> {
  const response = await api<{ data: Event }>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

export interface CreateEventSeatRow {
  name: string;
  seats: number;
  type: 'STANDARD' | 'PREMIUM' | 'ACCESSIBLE';
}

export async function createEventSeats(
  eventId: string,
  rows: CreateEventSeatRow[],
): Promise<Seat[]> {
  const response = await api<{ data: Seat[] }>(
    `/events/${eventId}/seats`,
    {
      method: 'POST',
      body: JSON.stringify({ rows }),
    },
  );

  return response.data;
}

export async function publishEvent(id: string): Promise<Event> {
  const response = await api<{ data: Event }>(
    `/events/${id}/publish`,
    {
      method: 'POST',
    },
  );

  return response.data;
}