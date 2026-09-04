import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { KundeComponent } from './kunde.component';
import { FahrerComponent } from './fahrer.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'kunde', component: KundeComponent },
  { path: 'fahrer', component: FahrerComponent },
  { path: '**', redirectTo: 'login' }
];