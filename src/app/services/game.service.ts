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
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
    return this.http.get<any>(
      `${this.apiUrl}/stats/user`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.estadistiques),
      tap(stats => {
        const userData = this.registreService.getUserData();
        if (userData && stats.punts_totals !== undefined) {
          userData.puntosTotales = stats.punts_totals;
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
            userData.puntosTotales = response.estadistiques.punts_totals;
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
    return localStorage.getItem('savedGame') !== null;
  }
}
