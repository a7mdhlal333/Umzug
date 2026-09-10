import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { LanguageService } from './language.service';
import { LoginComponent } from './login.component';
import { SessionService } from './session.service';
import { LoggedInUser, UserService } from './user.service';

describe('LoginComponent', () => {
  const loggedInUser: LoggedInUser = {
    id: 1,
    name: 'Ali',
    telefonnummer: '015750759010',
    rolle: 'KUNDE'
  };

  function createComponent(warmUp: () => Observable<void>, login = () => of(loggedInUser)) {
    const userService = {
      warmUp: vi.fn(warmUp),
      login: vi.fn(login)
    };
    const session = { login: vi.fn() };
    const router = { navigateByUrl: vi.fn() };
    const language = { t: (key: string) => key };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: SessionService, useValue: session },
        { provide: Router, useValue: router },
        { provide: LanguageService, useValue: language }
      ]
    });

    return {
      component: TestBed.createComponent(LoginComponent).componentInstance,
      userService,
      session,
      router
    };
  }

  it('waits for the shared warmup before sending a new login', () => {
    const ready = new Subject<void>();
    const setup = createComponent(() => ready.asObservable());

    setup.component.ngOnInit();
    setup.component.name = 'Ali';
    setup.component.telefonnummer = '0157 507-59010';
    setup.component.login();

    expect(setup.userService.warmUp).toHaveBeenCalledTimes(1);
    expect(setup.userService.login).not.toHaveBeenCalled();

    ready.next();

    expect(setup.userService.login).toHaveBeenCalledWith({
      name: 'Ali',
      telefonnummer: '015750759010',
      rolle: 'KUNDE'
    });
  });

  it('still sends the login when warmup fails', () => {
    const setup = createComponent(() => throwError(() => new Error('backend unavailable')));

    setup.component.ngOnInit();
    setup.component.name = 'Ali';
    setup.component.telefonnummer = '015750759010';
    setup.component.login();

    expect(setup.userService.warmUp).toHaveBeenCalledTimes(1);
    expect(setup.userService.login).toHaveBeenCalledTimes(1);
  });
});