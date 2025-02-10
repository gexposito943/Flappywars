import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RegistreService } from './registre.service';

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

  constructor(
    private http: HttpClient,
    private registreService: RegistreService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getShips(): Observable<Ship[]> {
    return this.http.get<{success: boolean, naus: Ship[]}>(
      `${this.apiUrl}/ships`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('Resposta naus:', response);
        return response.naus;
      })
    );
  }

  getUserShip(userId: number): Observable<Ship> {
    return this.http.get<Ship>(
      `${this.apiUrl}/users/${userId}/ship`,
      { headers: this.getHeaders() }
    );
  }

  updateUserShip(userId: number, shipId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/users/${userId}/ship`,
      { shipId },
      { headers: this.getHeaders() }
    );
  }
}

