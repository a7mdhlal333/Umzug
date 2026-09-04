import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { SessionService } from './session.service';
import { UserService } from './user.service';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-fahrer',
  standalone: true,
  templateUrl: './fahrer.component.html'
})
export class FahrerComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  readonly language = inject(LanguageService);
  readonly session = inject(SessionService);

  bookings: Booking[] = [];
  acceptedBookings: Booking[] = [];
  readonly kundeTelefonnummer: Record<number, string> = {};
  message = '';

  constructor() { this.loadBookings(); }

  loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        const fahrerId = this.session.user()?.id;
        this.bookings = bookings.filter((booking) => booking.status === 'NEU');
        this.acceptedBookings = bookings.filter((booking) => booking.status === 'ANGENOMMEN' && booking.fahrerId === fahrerId);
        this.acceptedBookings.forEach((booking) => this.loadKundeTelefonnummer(booking.kundeId));
      },
      error: () => this.message = this.language.t('bookingError')
    });
  }

  acceptBooking(booking: Booking): void {
    const fahrerId = this.session.user()?.id;
    if (!fahrerId) { this.router.navigateByUrl('/login'); return; }
    this.bookingService.acceptBooking(booking.id, fahrerId).subscribe({
      next: () => { this.message = this.language.t('bookingAccepted'); this.loadBookings(); },
      error: (error: HttpErrorResponse) => this.message = error.status === 403
        ? this.language.t('invalidDriver')
        : error.status === 404 ? this.language.t('notFound')
          : error.status === 409 ? this.language.t('alreadyAccepted')
            : this.language.t('bookingAcceptError')
    });
  }

  private loadKundeTelefonnummer(kundeId: number): void {
    if (this.kundeTelefonnummer[kundeId]) {
      return;
    }
    this.userService.getUser(kundeId).subscribe({
      next: (kunde) => this.kundeTelefonnummer[kundeId] = kunde.telefonnummer
    });
  }

  logout(): void { this.session.logout(); this.router.navigateByUrl('/login'); }
}