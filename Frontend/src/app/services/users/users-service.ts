import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me';

  getAllUsers() {
    return this.http.get(`${this.apiUrl}/api/users`);
  }

  createUser(data: any) {
    return this.http.post(`${this.apiUrl}/api/users`, data);
  }

  getUserById(id: number) {
    return this.http.get(`${this.apiUrl}/api/users/${id}`);
  }

  updateUser(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/api/users/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/api/users/${id}`);
  }
}
