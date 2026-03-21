import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';
import { LoginToken } from '../../models/login-token';

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
    this.isLoggedIn.set(!!localStorage.getItem('token'));
    this.isAdmin.set(localStorage.getItem('role') === 'admin');
  }

  login(email: string, password: string) {
    return this.http.post<LoginToken>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        this.isLoggedIn.set(true);
        this.isAdmin.set(response.role === "admin");
        if (this.isAdmin()) {
          this.router.navigate(['/dashboard'])
          }
        else {
          this.router.navigate(['/home'])
        }
        }
      )
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.router.navigate(['/login']);
  }

  getRol() {
    return !!localStorage.getItem('role')
  }

  getLogginStatus() {
    return this.isLoggedIn;
  }
}
