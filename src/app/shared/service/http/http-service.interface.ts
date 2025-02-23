// http-service.interface.ts
import { Observable } from 'rxjs';
import { HttpResponse } from './http-response.interface';

export interface IHttpService {
  get<T>(endpoint: string, options?: any): Observable<HttpResponse<T>>;
  post<T>(endpoint: string, data: any, options?: any): Observable<HttpResponse<T>>;
  put<T>(endpoint: string, data: any, options?: any): Observable<HttpResponse<T>>;
  delete<T>(endpoint: string, options?: any): Observable<HttpResponse<T>>;
}
