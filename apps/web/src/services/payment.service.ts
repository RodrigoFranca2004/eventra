import { api } from './api.service';

export interface PaymentResponse {
  status: 'CONFIRMED' | 'PAYMENT_FAILED';
}

export async function processPayment(
  reservationId: string,
  approved: boolean,
): Promise<PaymentResponse> {
  const response = await api<{ data: PaymentResponse }>(
    `/payments/${reservationId}`,
    {
      method: 'POST',
      body: JSON.stringify({ approved }),
    },
  );

  return response.data;
}