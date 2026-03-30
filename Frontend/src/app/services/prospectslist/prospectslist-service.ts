import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProspectslistService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me';

  getProspectsByTag(tag: string) {
    return this.http.get(`${this.apiUrl}/prospects/filter/${tag}`);
  }
  
  createProspect(data: any) {
    return this.http.post(`${this.apiUrl}/prospects`, data);
  }

  getProspects() {
    return this.http.get(`${this.apiUrl}/prospects`);
  }

  getProspectById(id: string) {
    return this.http.get(`${this.apiUrl}/prospects/${id}`);
  }

  updateProspect(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/prospects/${id}`, data);
  }

  deleteProspect(id: string) {
    return this.http.delete(`${this.apiUrl}/prospects/${id}`);
  }
}
