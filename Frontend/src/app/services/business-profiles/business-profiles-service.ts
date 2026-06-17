import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface BusinessProfilesQuery {
  page: number;
  pageSize: number;
  sector?: string;
  search?: string;
  sort?: 'nieuwste' | 'oudste';
}

@Injectable({
  providedIn: 'root',
})
export class BusinessProfilesServices {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me/companies';

  getAllBusinessProfiles() {
    return this.http.get(`${this.apiUrl}`);
  }

  getBusinessProfilesPaged(query: BusinessProfilesQuery) {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.sector && query.sector !== 'Alle sectoren') {
      params = params.set('sector', query.sector);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    return this.http.get(`${this.apiUrl}`, { params });
  }

  createBusinessProfiles(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  getBusinessProfileById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateBusinessProfile(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteBusinessProfile(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
