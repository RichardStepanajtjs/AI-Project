import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface FormPayload {
  partner_name: string;
  sector: string;
  description?: string;
  target_group?: string;
  technologies: string[];
  amount_of_prospects?: number;
  is_job?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me/forms';

  getFormById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createForm(data: FormPayload) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  processForm(formId: number) {
    return this.http.post(`${this.apiUrl}/${formId}/process`, {});
  }
}
