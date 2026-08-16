import { api } from './api.service';
import type {
  CreateReservationInput,
  CreateReservationResponse,
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