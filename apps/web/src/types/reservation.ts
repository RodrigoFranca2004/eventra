export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  reservationId: string;
  seatId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'USED';
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationDetails extends Reservation {
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  tickets: Ticket[];
}

export interface CreateReservationInput {
  eventId: string;
  seatIds: string[];
}

export interface CreateReservationResponse {
  reservation: Reservation;
  tickets: Ticket[];
}
