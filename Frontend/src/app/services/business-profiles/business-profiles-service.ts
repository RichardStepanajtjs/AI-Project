import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusinessProfilesServices {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me';

  getAllBusinessProfiles() {
    return this.http.get(`${this.apiUrl}/companies`);
  }

  createBusinessProfiles(data: any) {
    return this.http.post(`${this.apiUrl}/companies`, data);
  }

  getBusinessProfileById(id: number) {
    return this.http.get(`${this.apiUrl}/companies/${id}`);
  }

  updateBusinessProfile(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/companies/${id}`, data);
  }

  deleteBusinessProfile(id: number) {
    return this.http.delete(`${this.apiUrl}/companies/${id}`);
  }
}
