import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModelResponse } from '../../models/model';

@Injectable({
  providedIn: 'root'
})

export class ModelsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nest.sokrates.traefik.me/models';
  
  getAllModels(): Observable<ModelResponse>{
    return this.http.get<ModelResponse>(`${this.apiUrl}`);
  }

  getActiveModel(): Observable<ModelResponse>{
    return this.http.get<ModelResponse>(`${this.apiUrl}/active`);
  }

  getModel(id: string): Observable<ModelResponse>{
    return this.http.get<ModelResponse>(`${this.apiUrl}/${id}`)
  }

  createModel(data: any): Observable<void>{
    return this.http.post<void>(`${this.apiUrl}`, data);
  }

  updateModel(id: string, data: any): Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${id}`, data)
  }

  activateModel(id: string): Observable<void>{
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  deleteModel(id: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}