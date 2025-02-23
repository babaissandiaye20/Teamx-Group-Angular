// user.service.ts
import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/service/http/http.service';
import { Observable } from 'rxjs';
import { User, CreateUserDto, FindUserDto, UpdateUserDto } from '../user';
import { HttpResponse } from '../../../shared/service/http/http-response.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = 'users';

  constructor(private http: HttpService) {}

  getAll(filter?: FindUserDto): Observable<HttpResponse<User[]>> {
    const queryParams = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    return this.http.get<User[]>(`${this.endpoint}?${queryParams.toString()}`);
  }

  getById(id: string): Observable<HttpResponse<User>> {
    return this.http.get<User>(`${this.endpoint}/${id}`);
  }

  create(user: CreateUserDto): Observable<HttpResponse<User>> {
    return this.http.post<User>(this.endpoint, user);
  }

  update(id: string, user: UpdateUserDto): Observable<HttpResponse<User>> {
    return this.http.put<User>(`${this.endpoint}/${id}`, user);
  }

  delete(id: string): Observable<HttpResponse<User>> {
    return this.http.delete<User>(`${this.endpoint}/${id}`);
  }
}
