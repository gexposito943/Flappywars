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

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private registreService: RegistreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Si el error es 404, devolvemos el resultado por defecto
      if (error.status === 404) {
        console.warn(`${operation}: API endpoint not found, using default values`);
        return of(result as T);
      }

      // Registramos el error para debugging
      console.error(`${operation} error details:`, {
        status: error.status,
        message: error.message,
        url: error.url
      });

      // Devolvemos un resultado seguro por defecto
      return of(result as T);
    };
  }

  getUserStats(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      // Retornar datos mock para SSR
      return new Observable(observer => {
        observer.next({
          millor_puntuacio: 0,
          total_partides: 0,
          temps_total_jugat: 0
        });
        observer.complete();
      });
    }
    
    console.log('Obteniendo estadísticas del usuario');
    return this.http.get(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  getAvailableShips(): Observable<Ship[]> {
    return this.http.get<Ship[]>(
      `${this.apiUrl}/user/ships`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError<Ship[]>('getAvailableShips', []))
    );
  }

  updateUserShip(shipId: number): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable(observer => {
        observer.next({});
        observer.complete();
      });
    }
    return this.http.post(`${this.apiUrl}/updateShip`, { shipId }, { headers: this.getHeaders() });
  }

  getUserAchievements(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    return this.http.get(`${this.apiUrl}/achievements`, { headers: this.getHeaders() });
  }

  saveGameResults(gameData: GameData): Observable<{success: boolean}> {
    console.log('Guardando resultados del juego:', gameData);
    const headers = this.getHeaders();
    
    return this.http.post<{success: boolean}>(
      `${this.apiUrl}/game/save`,
      gameData,
      { headers }
    ).pipe(
      tap(response => console.log('Respuesta guardado:', response)),
      catchError(error => {
        console.error('Error al guardar resultados:', error);
        return of({ success: false });
      })
    );
  }
}
