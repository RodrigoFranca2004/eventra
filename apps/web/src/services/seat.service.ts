import { api } from './api.service';
import type { Seat } from '../types/seat';

export async function listEventSeats(eventId: string): Promise<Seat[]> {
  const response = await api<{ data: Seat[] }>(`/events/${eventId}/seats`);

  return response.data;
}