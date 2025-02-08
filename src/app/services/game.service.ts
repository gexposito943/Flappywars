import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { RegistreService } from './registre.service';

export interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
  punts_totals: number;
}

export interface Achievement {
  id: number;
  nom: string;
  completat: boolean;
}

export interface GameData {
  puntuacio: number;
  temps_jugat: number;
  nau_id: number;
}

export interface Ship {
  id: number;
  name: string;
}

export interface GameResult {
  usuari_id: number;
  puntuacio: number;
  duracio_segons: number;
  nau_utilitzada: number;
  nivell_dificultat: string;
  obstacles_superats: number;
  completada: boolean;
}

interface GlobalStats {
  username: string;
  punts_totals: number;
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

export interface Nau {
  id: string;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
  disponible: boolean;
}

export interface Obstacle {
  id: string;
  imatge_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(
    private http: HttpClient,
    private registreService: RegistreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.registreService.getToken();
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token || ''
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);

      if (error.status === 404) {
        console.warn(`${operation}: API endpoint not found, using default values`);
        return of(result as T);
      }

      console.error(`${operation} error details:`, {
        status: error.status,
        message: error.message,
        url: error.url
      });
      return of(result as T);
    };
  }

  getUserStats(): Observable<UserStats> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({
        millor_puntuacio: 0,
        total_partides: 0,
        temps_total_jugat: 0,
        punts_totals: 0
      });
    }

    return this.http.get<any>(
      `${this.apiUrl}/stats/user`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.estadistiques),
      tap(stats => {
        const userData = this.registreService.getUserData();
        if (userData && stats.punts_totals !== undefined) {
          userData.punts_totals = stats.punts_totals;
          this.registreService.setUserData(userData);
        }
      }),
      catchError(error => {
        console.error('Error al obtener estadísticas:', error);
        return of({
          millor_puntuacio: 0,
          total_partides: 0,
          temps_total_jugat: 0,
          punts_totals: 0
        });
      })
    );
  }

  getAvailableShips(): Observable<Ship[]> {
    return this.http.get<Ship[]>(
      `${this.apiUrl}/ships`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateUserShip(shipId: number): Observable<{success: boolean}> {
    return this.http.put<{success: boolean}>(
      `${this.apiUrl}/user/ship`,
      { shipId },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getUserAchievements(): Observable<Achievement[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    
    return this.http.get<Achievement[]>(
      `${this.apiUrl}/achievements`, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  saveGameResults(gameData: GameResult): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/stats/update`,
      {
        puntuacio: gameData.puntuacio,
        temps_jugat: gameData.duracio_segons
      },
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.estadistiques) {
          const userData = this.registreService.getUserData();
          if (userData) {
            userData.punts_totals = response.estadistiques.punts_totals;
            this.registreService.setUserData(userData);
          }
        }
      }),
      map(response => response.estadistiques),
      catchError(error => {
        console.error('Error al guardar resultados:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserStats(stats: UserStats): Observable<UserStats> {
    return this.http.put<UserStats>(
      `${this.apiUrl}/stats/update`,
      stats,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error al actualizar estadísticas:', error);
        return throwError(() => error);
      })
    );
  }

  hasSavedGame(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return localStorage.getItem('savedGame') !== null;
  }

  restoreGame(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ success: false, message: 'No disponible en SSR' });
    }

    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      return of({
        success: true,
        gameState: JSON.parse(savedGame)
      });
    }
    return of({ success: false, message: 'No hi ha partida guardada' });
  }

  getGlobalStats(): Observable<GlobalStats[]> {
    return this.http.get<GlobalStats[]>(
      `${this.apiUrl}/stats/global`,
      { headers: this.getHeaders() }
    ).pipe(
      map(stats => stats.sort((a, b) => b.punts_totals - a.punts_totals)),
      catchError(error => {
        console.error('Error obteniendo estadísticas globales:', error);
        return of([]);
      })
    );
  }

  getNau(): Observable<Nau> {
    return this.http.get<Nau>(
      `${this.apiUrl}/naus/default`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getObstacle(): Observable<Obstacle> {
    return this.http.get<Obstacle>(
      `${this.apiUrl}/obstacles/default`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  resetUserPoints(userId: string): Observable<any> {
    return this.http.post(
        `${this.apiUrl}/users/${userId}/reset-points`, 
        {},
        { headers: this.getHeaders() }
    );
  }
}
