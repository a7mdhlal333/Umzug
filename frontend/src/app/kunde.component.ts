import { Component, inject, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
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
export class KundeComponent implements OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  readonly language = inject(LanguageService);
  readonly session = inject(SessionService);

  bookings: Booking[] = [];
  von = '';
  nach = '';
  message = '';
  notice = '';
  readonly fahrerTelefonnummer: Record<number, string> = {};
  private previousStatuses = new Map<number, Booking['status']>();
  private hasLoadedBookings = false;
  private readonly polling = new Subscription();
  private noticeTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadBookings();
    this.polling.add(interval(10000).subscribe(() => this.loadBookings(true)));
  }

  loadBookings(isPoll = false): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        const userId = this.session.user()?.id;
        const customerBookings = bookings.filter((booking) => booking.kundeId === userId);
        if (isPoll && this.hasLoadedBookings && customerBookings.some((booking) =>
          this.previousStatuses.get(booking.id) === 'NEU' && booking.status === 'ANGENOMMEN')) {
          this.showNotice(this.language.t('driverFoundNotice'));
        }
        this.previousStatuses = new Map(customerBookings.map((booking) => [booking.id, booking.status]));
        this.hasLoadedBookings = true;
        this.bookings = customerBookings;
        this.bookings
          .filter((booking) => booking.status === 'ANGENOMMEN' && booking.fahrerId !== null)
          .forEach((booking) => this.loadFahrerTelefonnummer(booking.fahrerId as number));
      },
      error: () => this.message = 'Buchungen konnten nicht geladen werden.'
    });
  }

  ngOnDestroy(): void {
    this.polling.unsubscribe();
    this.language.stopSpeaking();
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }
  }

  private showNotice(text: string): void {
    this.notice = text;
    this.language.speak(text);
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }
    this.noticeTimeout = setTimeout(() => this.notice = '', 4000);
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