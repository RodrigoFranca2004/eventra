import { api } from './api.service';
import type { Event } from '../types/event';
import type { Seat } from '../types/seat';

export async function listPublishedEvents(): Promise<Event[]> {
  const response = await api<{ data: Event[] }>('/events');

  return response.data;
}

export async function getEventById(id: string): Promise<Event> {
  const response = await api<{ data: Event }>(`/events/${id}`);

  return response.data;
}

export async function listEventSeats(eventId: string): Promise<Seat[]> {
  const response = await api<{ data: Seat[] }>(`/events/${eventId}/seats`);

  return response.data;
}