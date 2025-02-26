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
  rol: 'admin' | 'user';
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

interface ApiResponse {
  success: boolean;
  message: string;
  user?: any;
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
  providedIn: 'root'
})
export class RegistreService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly REFRESH_THRESHOLD = 1020;
  private refreshTimeout: any;
  private readonly apiUrl = 'http://localhost:3000/api/v1';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(response: any): void {
    if (this.isBrowser && response.token && response.user) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.scheduleTokenRefresh();
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getUserData(): any {
    if (this.isBrowser) {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
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
        console.log('Resposta login:', response);
        if (response.success && response.token) {
          this.login(response);
          this.scheduleTokenRefresh();
        }
      }),
      catchError(error => {
        console.error('Error detallat en validateUser:', error.error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  public isValidJWT(token: string): boolean {
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

  checkEmailExists(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }

  checkUsernameExists(nom_usuari: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-username`, { nom_usuari });
  }

  getUserId(): string | null {
    const userData = this.getUserData();
    return userData ? userData.id : null;
  }

  setUserData(userData: any): void {
    if (this.isBrowser) {
        // Mantenir la estructura completa de l'usuari
        const currentData = this.getUserData();
        const updatedData = {
            ...currentData,
            ...userData,
            estadistiques: userData.estadistiques || currentData?.estadistiques,
            nau: userData.nau || currentData?.nau
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedData));
    }
  }

  updateUserProfile(userId: string, data: {
    nom_usuari?: string;
    email?: string;
    contrasenya?: string;
    idioma?: 'catala' | 'castella';
  }): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/usuaris/${userId}`, data);
  }

  public scheduleTokenRefresh(): void {
    const token = this.getToken();
    if (!token) return;

    const tokenData = this.decodeToken(token);
    if (!tokenData) return;

    const expiresIn = (tokenData.exp * 1000) - Date.now();
    // Programar refresh 17 minuts abans
    const refreshIn = expiresIn - (this.REFRESH_THRESHOLD * 1000);

    console.log('Token expira en:', Math.floor(expiresIn / 1000 / 60), 'minuts');
    console.log('Següent refresh en:', Math.floor(refreshIn / 1000 / 60), 'minuts');

    // Netejar timeout anterior si existeix
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // Programar següent refresh
    if (refreshIn > 0) {
      this.refreshTimeout = setTimeout(() => {
        console.log('Executant refresh token programat');
        this.refreshToken().subscribe({
          next: (response) => console.log('Token refrescat correctament'),
          error: (error) => console.error('Error al refrescar token:', error)
        });
      }, refreshIn);
    } else {
      // Si el token está próximo a expirar, refrescar inmediatament
      console.log('Token próximo a expirar, refrescando inmediatament');
      this.refreshToken().subscribe();
    }
  }

  refreshToken(): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}).pipe(
      tap(response => {
        if (response.success && response.token) {
          console.log('Token refrescat correctament');
          this.login(response);
          this.scheduleTokenRefresh(); // Programar següent refresh
        }
      }),
      catchError(error => {
        console.error('Error en refresh token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  }

  public checkTokenValidity(): boolean {
    const token = this.getToken();
    if (!token || !this.isValidJWT(token)) return false;
    
    const tokenData = this.decodeToken(token);
    if (!tokenData) return false;
    
    // Verificar si el token está a punt de expirar (menys de 5 minuts)
    const expiresIn = (tokenData.exp * 1000) - Date.now();
    if (expiresIn < 300000) { // 5 minuts en milisegundos
      console.log('Token a punt de expirar, refrescant...');
      this.refreshToken().subscribe();
      return false;
    }
    
    return true;
  }
}