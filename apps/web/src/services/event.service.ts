import { api } from './api.service';
import type { Event } from '../types/event';

interface ListEventsResponse {
  data: Event[];
}

export async function listPublishedEvents(): Promise<Event[]> {
  const response = await api<ListEventsResponse>('/events');

  return response.data;
}