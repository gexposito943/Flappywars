import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RegistreService {
  private apiURLRegister = 'http://localhost:3000/api/v1/register';
  private apiURLValidate = 'http://localhost:3000/api/v1/login';
  private storage: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    console.log(body);
    return this.http.post(this.apiURLRegister, body);
  }

  validateUser(username: string, password: string): Observable<any> {
    const body = { username, password };
    console.log(body);
    return this.http.post<any>(this.apiURLValidate, body);
  }

  saveToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('authToken', token);
    } else {
      this.storage['authToken'] = token;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return this.storage['authToken'] || null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('authToken', token);
    } else {
      this.storage['authToken'] = token;
    }
  }
}
