export type TicketStatus = 'ACTIVE' | 'CANCELLED' | 'USED';

export type SeatType = 'STANDARD' | 'PREMIUM' | 'ACCESSIBLE';

export interface Ticket {
  id: string;
  code: string;
  status: TicketStatus;
  createdAt: string;
  seat: {
    id: string;
    row: string;
    number: number;
    type: SeatType;
  };
  reservation: {
    id: string;
    event: {
      id: string;
      title: string;
      date: string;
      location: string;
      price: string;
    };
  };
}

export interface SharedTicket {
  id: string;
  status: 'ACTIVE';
  seat: {
    row: string;
    number: number;
    type: SeatType;
  };
  reservation: {
    event: {
      id: string;
      title: string;
      date: string;
      location: string;
    };
  };
}
