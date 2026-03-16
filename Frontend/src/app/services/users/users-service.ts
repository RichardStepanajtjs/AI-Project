import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me';

  getAllUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }

  createUser(data: any) {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  getUserById(id: number) {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}
