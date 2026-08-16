import { api } from './api.service';
import type { SharedTicket, Ticket } from '../types/ticket';

export async function listMyTickets(): Promise<Ticket[]> {
  const response = await api<{ data: Ticket[] }>('/tickets');

  return response.data;
}

export async function getTicketById(
  ticketId: string,
): Promise<Ticket> {
  const response = await api<{ data: Ticket }>(
    `/tickets/${ticketId}`,
  );

  return response.data;
}

export async function getTicketShareLink(
  ticketId: string,
): Promise<{ url: string }> {
  const response = await api<{ data: { url: string } }>(
    `/tickets/${ticketId}/share`,
  );

  return response.data;
}

export async function getSharedTicket(
  code: string,
): Promise<SharedTicket> {
  const response = await api<{ data: SharedTicket }>(
    `/tickets/share/${code}`,
  );

  return response.data;
}