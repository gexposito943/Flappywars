import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Ship {
  id: string;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
  punts_requerits: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getShips(): Observable<Ship[]> {
    return this.http.get<{success: boolean, naus: Ship[]}>(`${this.apiUrl}/ships`)
      .pipe(
        map(response => response.naus)
      );
  }

  getUserShip(userId: number): Observable<Ship> {
    return this.http.get<Ship>(`${this.apiUrl}/users/${userId}/ship`);
  }

  updateUserShip(userId: number, shipId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/ship`, { shipId });
  }
}
