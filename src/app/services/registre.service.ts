import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { throwError } from 'rxjs';


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
  private token: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar token al iniciar el servicio
    if (this.isInBrowser()) {
      const token = this.getToken();
      console.log('Token inicial:', token);
    }
  }

  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    console.log('Enviando petición de registro:', body);
    return this.http.post(`${this.apiUrl}/register`, body);
  }

  validateUser(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { 
      email: username,
      password: password 
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
          this.setUserData(response.user);
        } else {
          this.setToken(null);
          this.setUserData(null);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        this.setToken(null);
        this.setUserData(null);
        return throwError(() => error);
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

  getUserData(): any {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem(this.userDataKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return this.token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userDataKey);
    this.removeToken();
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

  private isInBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setToken(token: string | null): void {
    if (isPlatformBrowser(this.platformId)) {
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
    }
    this.token = token;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.token = null;
  }

  setUserData(userData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userDataKey, JSON.stringify(userData));
    }
  }
}
