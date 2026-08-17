export type SeatType = 'STANDARD' | 'PREMIUM' | 'ACCESSIBLE';

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: SeatType;
  available: boolean;
}