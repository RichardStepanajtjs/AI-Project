import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProspectslistService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me/prospect-lists';

  getProspectsByTag(tag: string) {
    return this.http.get(`${this.apiUrl}/filter/${tag}`);
  }
  
  createProspectList(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  getProspectLists() {
    return this.http.get(`${this.apiUrl}`);
  }

  getProspectListById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProspectList(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProspectList(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
