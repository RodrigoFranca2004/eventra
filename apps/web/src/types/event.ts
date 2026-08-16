export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  type: string;
  externalId: string | null;
  date: string;
  location: string;
  capacity: number;
  price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}