import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProspectslistService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me/prospects';

  getProspectsByTag(tag: string) {
    return this.http.get(`${this.apiUrl}/filter/${tag}`);
  }
  
  createProspect(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  getProspects() {
    return this.http.get(`${this.apiUrl}`);
  }

  getProspectById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProspect(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProspect(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
