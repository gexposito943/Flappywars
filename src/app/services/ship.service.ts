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
        // Ordenar naus per punts requerits (menor a major)
        return response.naus.sort((a, b) => 
          (a.punts_requerits || 0) - (b.punts_requerits || 0)
        );
      })
    );
  }

  getUserShip(userId: string): Observable<Ship> {
    return this.http.get<{success: boolean, nau: Ship}>(
      `${this.apiUrl}/user/ship/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.nau)
    );
  }

  updateUserShip(userId: string, shipId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/user/ship/${userId}`,
      { shipId },
      { headers: this.getHeaders() }
    );
  }
}

