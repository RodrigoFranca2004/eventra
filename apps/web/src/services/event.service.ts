import { api } from './api.service';
import type { Event } from '../types/event';

export async function listPublishedEvents(): Promise<Event[]> {
  const response = await api<{ data: Event[] }>('/events');

  return response.data;
}

export async function getEventById(id: string): Promise<Event> {
  const response = await api<{ data: Event }>(`/events/${id}`);

  return response.data;
}