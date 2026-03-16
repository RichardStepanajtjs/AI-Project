import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';
import { LoginResponse } from '../../models/login-response';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'https://nest.sokrates.traefik.me/users';

  isLoggedIn = signal(false);

  constructor() {
    // Indien de gebruiker refresht verliest hij de status van zijn login niet.
    this.isLoggedIn.set(!!localStorage.getItem('token'));
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
