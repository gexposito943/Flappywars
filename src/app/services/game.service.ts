import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { RegistreService } from './registre.service';
import { UserStats,GlobalStats } from '../interfaces/stats.interface';
import { ApiResponse as ApiResponseModel } from '../interfaces/api.interface';
import { Estadistica as EstadisticaModel } from '../models/estadistica.model';;
import { Estadistica, Partida, Nau, Obstacle } from '../models';
import { ShipService } from './ship.service';
import { Ship } from './ship.service';

interface ShipResponse {
  success: boolean;
  nau: {
    id: string;
    nom: string;
    velocitat: number;
    imatge_url: string;
    descripcio: string;
  };
}

interface DefaultShipResponse {
  success: boolean;
  data: {
    id: string;
    nom: string;
    velocitat: number;
    imatge_url: string;
    descripcio: string;
  };
}

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

  // GESTIÓ DE PARTIDES
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
          console.log('Partida guardada exitosamente:', response);
        }
      }),
      catchError(this.handleError('saveGameResults'))
    );
  }

  loadSavedGame(partidaId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/game/load/${partidaId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('loadSavedGame'))
    );
  }

  // GESTIÓ DE NAUS
  getUserShip(): Observable<ShipResponse> {
    const userId = this.registreService.getUserId();
    
    console.log('Obteniendo nave para usuario:', userId);
    
    return this.http.get<ShipResponse>(
      `${this.apiUrl}/user/ship/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('Respuesta getUserShip:', response);
      }),
      catchError(error => {
        console.error('Error getUserShip:', error);
        return this.getDefaultShip().pipe(
          map(defaultShip => ({
            success: defaultShip.success,
            nau: defaultShip.data // Convertir la respuesta al formato esperado
          }))
        );
      })
    );
  }

  getDefaultShip(): Observable<DefaultShipResponse> {
    return this.http.get<DefaultShipResponse>(
      `${this.apiUrl}/ships/default`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('Nave por defecto:', response);
      })
    );
  }

  // GESTIÓ D'ESTADÍSTIQUES
  getUserStats(userId: string): Observable<ApiResponseModel<EstadisticaModel>> {
    return this.http.get<ApiResponseModel<EstadisticaModel>>(
      `${this.apiUrl}/stats/${userId}`
    );
  }

  getGlobalStats(): Observable<ApiResponseModel<GlobalStats[]>> {
    return this.http.get<ApiResponseModel<GlobalStats[]>>(
      `${this.apiUrl}/stats/global`
    ).pipe(
      map(response => this.mapGlobalStats(response)),
      catchError(this.handleError('getGlobalStats', { success: false, ranking: [] }))
    );
  }

  // Mètodes privats d'ajuda
  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
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

  updateUserStats(stats: UserStats): Observable<UserStats> {
    return this.http.put<UserStats>(
      `${this.apiUrl}/stats/update`,
      stats,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error el actualitzar estadístiques:', error);
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
    return this.http.post<ApiResponseModel<void>>(
        `${this.apiUrl}/stats/${userId}/reset`,
        {},
        { headers: this.getHeaders() }
    ).pipe(
        catchError(error => {
            console.error('Error al reiniciar punts:', error);
            return throwError(() => error);
        })
    );
  }

  checkSavedGame(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/users/${userId}/saved-game`);
  }

  savePartida(partida: Partida): Observable<ApiResponseModel<Partida>> {
    return this.http.post<ApiResponseModel<Partida>>(`${this.apiUrl}/partides`, partida);
  }

  getLastSavedGameId(): string | null {
    return localStorage.getItem('lastGameId');
  }

  clearLastSavedGame(): void {
    localStorage.removeItem('lastGameId');
  }

  getDefaultObstacle(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obstacles/default`).pipe(
        catchError(error => {
            console.error('Error en getDefaultObstacle:', error);
            return throwError(() => error);
        })
    );
  }

  private mapPartidaToPayload(gameData: Partida) {
    return {
      puntuacio: gameData.puntuacio,
      duracio_segons: gameData.duracio_segons,
      nau_utilitzada: gameData.nau_utilitzada,
      obstacles_superats: gameData.obstacles_superats,
      posicioX: gameData.posicioX,
      posicioY: gameData.posicioY,
      obstacles: gameData.obstacles,
      completada: gameData.completada
    };
  }

  private saveGameId(response: any): void {
    if (response.success && response.partidaId) {
      localStorage.setItem('lastGameId', response.partidaId);
    }
  }

  private mapGlobalStats(response: ApiResponseModel<GlobalStats[]>) {
    return {
      success: response.success,
      ranking: response.ranking || []
    };
  }
}
