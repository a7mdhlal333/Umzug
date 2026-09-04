import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { SessionService } from './session.service';
import { AddressInputComponent } from './address-input.component';
import { UserService } from './user.service';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-kunde',
  standalone: true,
  imports: [FormsModule, AddressInputComponent],
  templateUrl: './kunde.component.html'
})
export class KundeComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  readonly language = inject(LanguageService);
  readonly session = inject(SessionService);

  bookings: Booking[] = [];
  von = '';
  nach = '';
  message = '';
  readonly fahrerTelefonnummer: Record<number, string> = {};

  constructor() {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        const userId = this.session.user()?.id;
        this.bookings = bookings.filter((booking) => booking.kundeId === userId);
        this.bookings
          .filter((booking) => booking.status === 'ANGENOMMEN' && booking.fahrerId !== null)
          .forEach((booking) => this.loadFahrerTelefonnummer(booking.fahrerId as number));
      },
      error: () => this.message = 'Buchungen konnten nicht geladen werden.'
    });
  }

  private loadFahrerTelefonnummer(fahrerId: number): void {
    if (this.fahrerTelefonnummer[fahrerId]) {
      return;
    }
    this.userService.getUser(fahrerId).subscribe({
      next: (fahrer) => this.fahrerTelefonnummer[fahrerId] = fahrer.telefonnummer
    });
  }

  createBooking(): void {
    if (!this.von.trim() || !this.nach.trim()) {
      this.message = this.language.t('missingAddresses');
      return;
    }

    const kundeId = this.session.user()?.id;
    if (!kundeId) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.bookingService.createBooking({ kundeId, von: this.von, nach: this.nach }).subscribe({
      next: () => {
        this.message = this.language.t('bookingCreated');
        this.von = '';
        this.nach = '';
        this.loadBookings();
      },
      error: (error: HttpErrorResponse) => this.message = error.status === 404
        ? this.language.t('customerNotFound')
        : this.language.t('bookingError')
    });
  }

  logout(): void {
    this.session.logout();
    this.router.navigateByUrl('/login');
  }
}