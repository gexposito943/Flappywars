import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { throwError } from 'rxjs';

interface Nau {
  id: string;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
  disponible: boolean;
  data_creacio: string;
}

interface Usuari {
  id: string;
  nom_usuari: string;
  email: string;
  contrasenya: string;
  nivell: number;
  punts_totals: number;
  data_registre: string;
  ultim_acces: string | null;
  estat: 'actiu' | 'inactiu' | 'bloquejat';
  intents_login: number;
  nau_actual: string | null;
  nau?: {
    id: string;
    nom: string;
    imatge_url: string;
  };
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: Omit<Usuari, 'contrasenya'>;
}

const API_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  NAUS: '/naus',
  NIVELLS: '/nivells',
  USUARI: {
    PERFIL: '/usuari/perfil',
    PARTIDES: '/usuari/partides',
    ESTADISTIQUES: '/usuari/estadistiques'
  }
};

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
    if (this.isInBrowser()) {
      const token = this.getToken();
      console.log('Token inicial:', token);
    }
  }

  register(nom_usuari: string, email: string, contrasenya: string): Observable<any> {
    const body = { 
      nom_usuari,
      email, 
      contrasenya
    };
    console.log('Enviant petició de registre:', body);
    return this.http.post(`${this.apiUrl}${API_ROUTES.REGISTER}`, body);
  }

  validateUser(email: string, contrasenya: string): Observable<AuthResponse> {
    console.log('Intentant login amb:', { email });
    
    return this.http.post<AuthResponse>(`${this.apiUrl}${API_ROUTES.LOGIN}`, { 
      email,
      contrasenya
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setUserData(response.user);
          }
        }
      }),
      catchError(error => {
        console.error('Error en validateUser:', error);
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
      console.error('Error validant token JWT:', e);
      return false;
    }
  }

  getUserData(): Omit<Usuari, 'contrasenya'> | null {
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userDataKey);
    }
    this.token = null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && this.isValidJWT(token);
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }

  checkUsernameExists(nom_usuari: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-username`, { nom_usuari });
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

  getUserId(): string | null {
    const userData = this.getUserData();
    return userData ? userData.id : null;
  }

  setUserData(userData: Omit<Usuari, 'contrasenya'> | null): void {
    if (isPlatformBrowser(this.platformId) && userData) {
      localStorage.setItem(this.userDataKey, JSON.stringify(userData));
      console.log('Dades desades:', userData);
    }
  }
}