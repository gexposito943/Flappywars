import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class RegistreService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private storage: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    console.log('Enviando petición de registro:', body);
    return this.http.post(`${this.apiUrl}/register`, body);
  }

  validateUser(email: string, password: string): Observable<AuthResponse> {
    console.log('Enviando petición de login:', { email });
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
        tap(response => {
            if (response && response.token) {
                this.setToken(response.token);
            }
        })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }

  checkUsernameExists(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-username`, { username });
  }
}
