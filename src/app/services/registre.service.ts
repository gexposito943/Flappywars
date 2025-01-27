import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';


interface AuthResponse {
  token: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class RegistreService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private tokenKey = 'auth_token';
  private userDataKey = 'user_data';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  private isInBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

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
    if (!this.isInBrowser()) {
      return;
    }
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.isInBrowser()) {
      return null;
    }
    const token = localStorage.getItem(this.tokenKey);
    console.log('Retrieved token:', token);
    return token;
  }

  setToken(token: string): void {
    if (!this.isInBrowser()) {
      return;
    }
    console.log('Setting token:', token);
    localStorage.setItem(this.tokenKey, token);
  }

  getUserData() {
    if (!this.isInBrowser()) {
      return null;
    }
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    if (!this.isInBrowser()) {
      return;
    }
    console.log('Logging out, clearing storage');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userDataKey);
  }

  isLoggedIn(): boolean {
    if (!this.isInBrowser()) {
      return false;
    }
    return !!this.getToken();
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }

  checkUsernameExists(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-username`, { username });
  }

  setUserData(userData: any): void {
    if (!this.isInBrowser()) {
      return;
    }
    localStorage.setItem('userData', JSON.stringify(userData));
  }
}
