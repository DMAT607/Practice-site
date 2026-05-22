import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then((c) => c.SignupComponent),
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  { path: '**', redirectTo: 'login' },
];
