import { Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService, UserRole } from './session.service';
import { UserService } from './user.service';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly userService = inject(UserService);
  readonly language = inject(LanguageService);

  name = '';
  telefonnummer = '';
  rolle: UserRole = 'KUNDE';
  message = '';
  isSubmitting = false;
  readonly phonePattern = '^(\\+49|0049|0)[1-9][0-9]{6,13}$';

  ngOnInit(): void {
    this.userService.warmUp().subscribe({ error: () => undefined });
  }

  login(): void {
    const name = this.name.trim();
    const telefonnummer = this.telefonnummer.trim().replace(/[\s()-]/g, '');

    if (!name || !telefonnummer) {
      this.message = this.language.t('missingLogin');
      return;
    }

    if (!new RegExp(this.phonePattern).test(telefonnummer)) {
      this.message = this.language.t('invalidPhone');
      return;
    }

    this.message = '';
    this.isSubmitting = true;
    this.userService.login({
      name,
      telefonnummer,
      rolle: this.rolle
    }).subscribe({
      next: (user) => {
        this.session.login({
          id: user.id,
          name: user.name,
          telefonnummer: user.telefonnummer,
          rolle: user.rolle
        });
        this.router.navigateByUrl(user.rolle === 'KUNDE' ? '/kunde' : '/fahrer');
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.message = error.status === 400 ? this.language.t('invalidPhone') : this.language.t('loginError');
      }
    });
  }
}