import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { RegistreService } from './registre.service';

export interface Ship {
  id: number;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
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
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getShips(): Observable<Ship[]> {
    return this.http.get<Ship[]>(`${this.apiUrl}/naus`, { 
      headers: this.getHeaders() 
    });
  }

  getUserShip(userId: number): Observable<Ship> {
    return this.http.get<Ship>(`${this.apiUrl}/users/${userId}/ship`, {
      headers: this.getHeaders()
    });
  }

  updateUserShip(userId: number, shipId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/ship`, 
      { shipId }, 
      { headers: this.getHeaders() }
    );
  }
}
