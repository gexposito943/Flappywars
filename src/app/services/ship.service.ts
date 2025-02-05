import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { RegistreService } from './registre.service';

export interface Ship {
  id: number;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
  required_points: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  private apiUrl = 'http://localhost:3000/api/v1';

  private API_ROUTES = {
    SHIPS: '/ships',
    ACHIEVEMENTS: '/user/achievements'
  };

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
    }).pipe(
      catchError(error => {
        console.error('Error loading ships:', error);
        return of([
          {
            id: 1,
            nom: 'Nau de Combat',
            velocitat: 100,
            imatge_url: 'assets/images/naus/x-wing.png',
            descripcio: 'Nau de combat versàtil',
            required_points: 0
          },
          {
            id: 2,
            nom: 'Nau Imperial',
            velocitat: 120,
            imatge_url: 'assets/images/naus/tie-fighter.png',
            descripcio: 'Nau ràpida de l\'Imperi',
            required_points: 1000
          },
          {
            id: 3,
            nom: 'Nau Llegendària',
            velocitat: 150,
            imatge_url: 'assets/images/naus/millenium-falcon.png',
            descripcio: 'Nau llegendària',
            required_points: 2500
          }
        ]);
      })
    );
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
