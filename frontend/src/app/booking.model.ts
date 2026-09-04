export type BookingStatus = 'NEU' | 'ANGENOMMEN';

export interface Booking {
  id: number;
  kundeId: number;
  fahrerId: number | null;
  von: string;
  nach: string;
  status: BookingStatus;
}

export interface CreateBookingRequest {
  kundeId: number;
  von: string;
  nach: string;
}
