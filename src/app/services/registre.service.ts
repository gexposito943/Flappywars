import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';


interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    nivel: number;
    puntosTotales: number;
    naveActual: number;
    nombreNave: string;
  };
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
    console.log('Iniciando login:', email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.success && response.token) {
          console.log('Login exitoso, token recibido');
          const tokenToStore = response.token.startsWith('Bearer ') 
            ? response.token 
            : `Bearer ${response.token}`;
          
          localStorage.setItem(this.tokenKey, tokenToStore);
          
          if (response.user) {
            localStorage.setItem(this.userDataKey, JSON.stringify(response.user));
          }
        }
      })
    );
  }

  private isValidJWT(token: string): boolean {
    if (!token) return false;
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const parts = actualToken.split('.');
    if (parts.length !== 3) return false;
    
    try {
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      return true;
    } catch (e) {
      console.error('Error validando token JWT:', e);
      return false;
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Token recuperado:', token);
    return token;
  }

  logout(): void {
    if (!this.isInBrowser()) return;
    console.log('Logging out, clearing storage');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userDataKey);
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

  setUserData(userData: any): void {
    if (this.isInBrowser()) {
      localStorage.setItem(this.userDataKey, JSON.stringify(userData));
    }
  }

  getUserData() {
    const userData = localStorage.getItem(this.userDataKey);
    return userData ? JSON.parse(userData) : null;
  }

  setToken(token: string): void {
    if (this.isInBrowser() && token) {
      localStorage.setItem(this.tokenKey, token);
    }
  }
}
