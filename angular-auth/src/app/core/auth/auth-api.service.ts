import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from 'src/app/types/Login';
import { SignupPayload, SignupResponse } from 'src/app/types/Signup';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/auth/login`,
      {
        email,
        password,
      },
      { withCredentials: true },
    );
  }

  signup(data: SignupPayload): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.baseUrl}/auth/signup`, data);
  }

  refresh() {
    return this.http.post<any>(
      `${this.baseUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );
  }

  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/logout`, {
      withCredentials: true,
    });
  }
}
