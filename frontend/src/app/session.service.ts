import { Injectable, signal } from '@angular/core';

export type UserRole = 'KUNDE' | 'FAHRER';

export interface SessionUser {
  id: number;
  name: string;
  telefonnummer: string;
  rolle: UserRole;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'umzug-session';
  readonly user = signal<SessionUser | null>(this.readSession());

  login(sessionUser: SessionUser): void {
    this.user.set(sessionUser);
    localStorage.setItem(this.storageKey, JSON.stringify(sessionUser));
  }

  logout(): void {
    this.user.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private readSession(): SessionUser | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as SessionUser;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}