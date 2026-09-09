import { Component, inject, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
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
export class FahrerComponent implements OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  readonly language = inject(LanguageService);
  readonly session = inject(SessionService);

  bookings: Booking[] = [];
  acceptedBookings: Booking[] = [];
  readonly kundeTelefonnummer: Record<number, string> = {};
  message = '';
  notice = '';
  private knownBookingIds: Set<number> | null = null;
  private readonly polling = new Subscription();
  private noticeTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadBookings();
    this.polling.add(interval(10000).subscribe(() => this.loadBookings(true)));
  }

  loadBookings(isPoll = false): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        const currentBookingIds = new Set(bookings.map((booking) => booking.id));
        if (isPoll && this.knownBookingIds) {
          const hasNewRequest = bookings.some((booking) => booking.status === 'NEU' && !this.knownBookingIds?.has(booking.id));
          if (hasNewRequest) {
            this.showNotice(this.language.t('newRequestNotice'));
          }
        }
        this.knownBookingIds = currentBookingIds;
        const fahrerId = this.session.user()?.id;
        this.bookings = bookings.filter((booking) => booking.status === 'NEU');
        this.acceptedBookings = bookings.filter((booking) => booking.status === 'ANGENOMMEN' && booking.fahrerId === fahrerId);
        this.acceptedBookings.forEach((booking) => this.loadKundeTelefonnummer(booking.kundeId));
      },
      error: () => this.message = this.language.t('bookingError')
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

  async kopiereNummer(nummer: string): Promise<void> {
    if (!navigator.clipboard) {
      this.showNotice(this.language.t('copyError'));
      return;
    }

    try {
      await navigator.clipboard.writeText(nummer);
      this.showNotice(this.language.t('numberCopied'));
    } catch {
      this.showNotice(this.language.t('copyError'));
    }
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