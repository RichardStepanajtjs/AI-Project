import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProspectslistService {
  private http = inject(HttpClient);
  private apiUrl = 'nest.sokrates.traefik.me';

  createProspect(data: any) {
    return this.http.post(`${this.apiUrl}/api/prospects`, data);
  }

  getProspects() {
    return this.http.get(`${this.apiUrl}/api/prospects`);
  }

  getProspectById(id: string) {
    return this.http.get(`${this.apiUrl}/api/prospects/${id}`);
  }

  updateProspect(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/api/prospects/${id}`, data);
  }

  deleteProspect(id: string) {
    return this.http.delete(`${this.apiUrl}/api/prospects/${id}`);
  }
}
