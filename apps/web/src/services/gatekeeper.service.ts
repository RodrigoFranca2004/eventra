import { api } from './api.service';

export type TicketValidationReason =
  | 'INVALID'
  | 'ALREADY_USED'
  | 'WRONG_EVENT';

export interface TicketValidationResponse {
  valid: boolean;
  message: string;
  reason?: TicketValidationReason;
  data?: {
    id: string;
    event: string;
    seat: {
      row: string;
      number: number;
    };
  };
}

export async function validateTicket(
  code: string,
  eventId: string,
): Promise<TicketValidationResponse> {
  return api<TicketValidationResponse>(
    '/gatekeeper/validate',
    {
      method: 'POST',
      body: JSON.stringify({
        code,
        eventId,
      }),
    },
  );
}
