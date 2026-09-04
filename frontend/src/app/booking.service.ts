import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, CreateBookingRequest } from './booking.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bookings`;

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  createBooking(request: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, request);
  }

  acceptBooking(id: number, fahrerId: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/accept`, { fahrerId });
  }
}
