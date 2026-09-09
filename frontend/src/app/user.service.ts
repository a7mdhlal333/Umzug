import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { UserRole } from './session.service';

export interface LoginRequest {
  name: string;
  telefonnummer: string;
  rolle: UserRole;
}

export interface LoggedInUser extends LoginRequest {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  login(request: LoginRequest): Observable<LoggedInUser> {
    return this.http.post<LoggedInUser>(`${this.apiUrl}/login`, request);
  }

  warmUp(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/health`);
  }

  getUser(id: number): Observable<LoggedInUser> {
    return this.http.get<LoggedInUser>(`${this.apiUrl}/${id}`);
  }
}