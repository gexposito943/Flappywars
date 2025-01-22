import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

interface GameData {
  puntuacio: number;
  temps_jugat: number;
  nau_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(
    private http: HttpClient,
    private registreService: RegistreService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(
      `${this.apiUrl}/user/stats`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAvailableShips(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/user/ships`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateUserShip(shipId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/user/ship`,
      { shipId },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(
      `${this.apiUrl}/user/achievements`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  saveGameResults(gameData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/game/save`,
      gameData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
