import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { RegistreService } from './registre.service';
import { UserStats, ApiResponse, GlobalStats } from '../interfaces/stats.interface';
import { ApiResponse as ApiResponseModel } from '../interfaces/api.interface';
import { Estadistica as EstadisticaModel } from '../models/estadistica.model';;
import { Estadistica, Partida, Nau, Obstacle } from '../models';
import { ShipService } from './ship.service';
import { Ship } from './ship.service';

@Injectable({
  providedIn: 'root'
})

export class GameService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(
    private http: HttpClient,
    private shipService: ShipService,
    private registreService: RegistreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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

  getUserStats(userId: string): Observable<ApiResponseModel<EstadisticaModel>> {
    return this.http.get<ApiResponseModel<EstadisticaModel>>(`${this.apiUrl}/stats/${userId}`);
  }

  getAvailableShips(): Observable<Ship[]> {
    return this.shipService.getShips();
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

  getUserAchievements(): Observable<Estadistica[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    
    return this.http.get<Estadistica[]>(
      `${this.apiUrl}/achievements`, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );

  }

  saveGameResults(gameData: Partida): Observable<any> {
    const payload = {
      puntuacio: gameData.puntuacio,
      duracio_segons: gameData.duracio_segons,
      nau_utilitzada: gameData.nau_utilitzada,
      obstacles_superats: gameData.obstacles_superats,
      posicioX: gameData.posicioX,
      posicioY: gameData.posicioY,
      obstacles: gameData.obstacles,
      completada: gameData.completada
    };

    return this.http.post<any>(
      `${this.apiUrl}/game/save`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Guardar ID de partida para posible restauración
          localStorage.setItem('lastGameId', response.partidaId);
        }
      }),
      catchError(this.handleError('saveGameResults'))
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

  getGlobalStats(): Observable<ApiResponseModel<GlobalStats[]>> {
    return this.http.get<ApiResponseModel<GlobalStats[]>>(
        `${this.apiUrl}/stats/global`
    ).pipe(
        map(response => ({
            success: response.success,
            ranking: response.ranking || []
        })),
        catchError(error => {
            console.error('Error obteniendo estadísticas globales:', error);
            return of({ success: false, ranking: [] });
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

  resetUserPoints(userId: string): Observable<ApiResponseModel<void>> {
    return this.http.post<ApiResponseModel<void>>(`${this.apiUrl}/users/${userId}/reset-points`, {});
  }

  checkSavedGame(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/users/${userId}/saved-game`);
  }

  savePartida(partida: Partida): Observable<ApiResponseModel<Partida>> {
    return this.http.post<ApiResponseModel<Partida>>(`${this.apiUrl}/partides`, partida);
  }

  loadSavedGame(partidaId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/game/load/${partidaId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('loadSavedGame'))
    );
  }

  getLastSavedGameId(): string | null {
    return localStorage.getItem('lastGameId');
  }

  clearLastSavedGame(): void {
    localStorage.removeItem('lastGameId');
  }

  getDefaultShip(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/naus/default`).pipe(
        catchError(error => {
            console.error('Error en getDefaultShip:', error);
            return throwError(() => error);
        })
    );
  }

  getDefaultObstacle(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obstacles/default`).pipe(
        catchError(error => {
            console.error('Error en getDefaultObstacle:', error);
            return throwError(() => error);
        })
    );
  }

  getUserShip() {
    return this.http.get<any>(`${this.apiUrl}/user/ship`);
  }
}
