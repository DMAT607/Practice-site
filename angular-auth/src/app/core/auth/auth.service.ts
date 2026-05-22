import { computed, Injectable, signal } from '@angular/core';
import { User } from 'src/app/types/Login';
import { AuthApiService } from './auth-api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { SignupPayload } from 'src/app/types/Signup';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ----- private writable signals -----
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _signupLoading = signal(false);
  private _signupError = signal<string | null>(null);
  private _accessToken = signal<string | null>(null);
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  // ----- public readonly signals -----
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  signupLoading = this._signupLoading.asReadonly();
  signupError = this._signupError.asReadonly();
  accessToken = this._accessToken.asReadonly();

  constructor(
    private api: AuthApiService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  // ------- refresh token functions---------
  getRefreshState() {
    return {
      isRefreshing: this.isRefreshing,
      refreshSubject: this.refreshSubject,
    };
  }

  setRefreshing(value: boolean) {
    this.isRefreshing = value;
  }

  emitNewToken(token: string | null) {
    this.refreshSubject.next(token);
  }

  // ----- login flow -----
  login(email: string, password: string) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .login(email, password)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this._accessToken.set(response.accessToken);
            this.toastr.success('Logged in successfully', 'Welcome');
            this.router.navigate(['/home']);
          } else {
            this._error.set('Login failed');
            this.toastr.error('Login failed');
          }
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Login failed');
          this._error.set(err.message || 'Error logging in');
        },
      });
  }

  // ----- signup flow -----
  signup(data: SignupPayload) {
    this._signupLoading.set(true);
    this._signupError.set(null);

    this.api.signup(data).subscribe({
      next: (response) => {
        console.log('Response: ', response);
        if (response.success) {
          this.toastr.success(
            response?.message || 'Account created successfully!',
          );
          // small delay feels nicer than instant teleport
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 800);
        } else {
          this._signupError.set(response.error || 'Error signing up');
        }
        this._signupLoading.set(false);
      },
      error: (err) => {
        console.log('Check err: ', err);
        this.toastr.error(err?.error?.message || 'Error signing up');
        this._signupError.set(err?.error?.message || 'Error signing up');
        this._signupLoading.set(false);
      },
    });
  }

  // ----- logout flow -----

  logout() {
    this.api.logout().subscribe({
      next: () => {
        this._accessToken.set(null);
        this.router.navigate(['/login']);
        this.toastr.success('Logged out successfully');
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Error logging out');
      },
    });
    // this._user.set(null);
    // this._accessToken.set(null);
    // this.router.navigate(['/login']);
  }

  refresh() {
    return this.api.refresh(); // we’ll define this next
  }

  setAccessToken(token: string | null) {
    this._accessToken.set(token);
  }
}
