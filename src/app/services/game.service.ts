import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RegistreService } from './registre.service';

interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private registreService: RegistreService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUserStats(): Observable<any> {
    // Simulación temporal - reemplazar con llamada real al backend
    return of({
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: 7200
    });
  }

  getAvailableShips(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/ships`, {
      headers: this.getHeaders()
    });
  }

  updateUserShip(shipId: number): Observable<any> {
    return of({ success: true });
  }

  getUserAchievements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/achievements`, {
      headers: this.getHeaders()
    });
  }

  saveGameResults(gameData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/game/save`, gameData, {
      headers: this.getHeaders()
    });
  }
}
