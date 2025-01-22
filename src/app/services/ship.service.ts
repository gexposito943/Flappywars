import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  private ships: Ship[] = [
    {
      id: 1,
      nom: 'X-Wing',
      velocitat: 1,
      imatge_url: '/assets/images/naus/x-wing.png',
      descripcio: 'Nau de combat versàtil'
    },
    {
      id: 2,
      nom: 'TIE Fighter',
      velocitat: 2,
      imatge_url: '/assets/images/naus/tie-fighter.png',
      descripcio: 'Nau ràpida de l\'Imperi'
    },
    {
      id: 3,
      nom: 'Millennium Falcon',
      velocitat: 3,
      imatge_url: '/assets/images/naus/millennium-falcon.png',
      descripcio: 'Nau llegendària'
    }
  ];

  getShips(): Observable<Ship[]> {
    return of(this.ships);
  }
}
