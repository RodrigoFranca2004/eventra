export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string | null;
  type: 'MOVIE' | 'SHOW';
  externalId: string | null;
  date: string;
  location: string;
  capacity: number;
  price: number | string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUrl: string | null;
}