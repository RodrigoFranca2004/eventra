import { api } from './api.service';
import type {
  CreateReservationInput,
  CreateReservationResponse,
  ReservationDetails,
} from '../types/reservation';

export async function createReservation(
  data: CreateReservationInput,
): Promise<CreateReservationResponse> {
  const response = await api<{ data: CreateReservationResponse }>(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

export async function getReservationById(
  reservationId: string,
): Promise<ReservationDetails> {
  const response = await api<{ data: ReservationDetails }>(
    `/reservations/${reservationId}`,
  );

  return response.data;
}