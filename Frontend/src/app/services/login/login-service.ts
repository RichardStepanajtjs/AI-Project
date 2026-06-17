import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';
import { LoginResponse } from '../../models/login-response';

// JWT implemented 
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'https://nest.sokrates.traefik.me/users';

  isLoggedIn = signal(false);
  isAdmin = signal(false);

  constructor() {
    const token = sessionStorage.getItem('token');
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        this.isLoggedIn.set(true);
        this.isAdmin.set((payload['role'] ?? payload['roles']?.[0] ?? '') === 'admin');
      } else {
        sessionStorage.removeItem('token');
      }
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);

        const payload = decodeJwtPayload(response.token);
        const role = payload?.['role'] ?? payload?.['roles']?.[0] ?? response.data.role;

        this.isLoggedIn.set(true);
        this.isAdmin.set(role === 'admin');

        if (this.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      })
    );
  }

  logout() {
    sessionStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.router.navigate(['/login']);
  }

  getRol(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.['role'] ?? payload?.['roles']?.[0] ?? null;
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getEmail(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.['email'] ?? payload?.['sub'] ?? null;
  }

  getUserId(): number | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.['id'] ?? null;
  }

  getLogginStatus() {
    return this.isLoggedIn;
  }
}
