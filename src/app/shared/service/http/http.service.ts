// services/http.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environneemnt/environment';
import { IHttpService } from './http-service.interface';
import { HttpResponse } from './http-response.interface';

@Injectable({
  providedIn: 'root'
})
export class HttpService implements IHttpService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(data: any): HttpHeaders {
    if (data instanceof FormData) {
      return new HttpHeaders(); // Le navigateur gère automatiquement pour FormData
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  get<T>(endpoint: string, options: any = {}): Observable<HttpResponse<T>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const finalOptions = { ...options, headers };
    
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, finalOptions)
      .pipe(
        map(response => ({
          data: response as T,
          status: 200,
          id: crypto.randomUUID()
        }))
      );
  }

  post<T>(endpoint: string, data: any, options: any = {}): Observable<HttpResponse<T>> {
    const headers = this.getHeaders(data);
    const finalOptions = { ...options, headers };
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, finalOptions)
      .pipe(
        map(response => ({
          data: response as T,
          status: 201,
          id: crypto.randomUUID()
        }))
      );
  }

  put<T>(endpoint: string, data: any, options: any = {}): Observable<HttpResponse<T>> {
    const headers = this.getHeaders(data);
    const finalOptions = { ...options, headers };
    
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, finalOptions)
      .pipe(
        map(response => ({
          data: response as T,
          status: 200,
          id: crypto.randomUUID()
        }))
      );
  }

  delete<T>(endpoint: string, options: any = {}): Observable<HttpResponse<T>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const finalOptions = { ...options, headers };
    
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, finalOptions)
      .pipe(
        map(response => ({
          data: response as T,
          status: 200,
          id: crypto.randomUUID()
        }))
      );
  }
}