import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ShipService } from './ship.service';

describe('ShipService', () => {
  let service: ShipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should return a list of ships', (done) => {
    service.getShips().subscribe((ships) => {
      expect(ships.length).toBeGreaterThan(0);
      done(); 
    });
  });
  it('should return ships with correct properties', (done) => {
    service.getShips().subscribe((ships) => {
      const firstShip = ships[0];
      expect(firstShip.id).toBe(1);
      expect(firstShip.nom).toBe('X-Wing');
      expect(firstShip.velocitat).toBe(1);
      expect(firstShip.imatge_url).toBe('/assets/images/naus/x-wing.png');
      expect(firstShip.descripcio).toBe('Nau de combat versàtil');
      done();
    });
  });
  it('should have ships with increasing velocities', (done) => {
    service.getShips().subscribe((ships) => {
      expect(ships[0].velocitat).toBeLessThan(ships[1].velocitat);
      expect(ships[1].velocitat).toBeLessThan(ships[2].velocitat);
      done();
    });
  });
  it('should have unique ship IDs', (done) => {
    service.getShips().subscribe((ships) => {
      const ids = ships.map(ship => ship.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ships.length);
      done();
    });
  });
  it('should have valid image URLs for all ships', (done) => {
    service.getShips().subscribe((ships) => {
      ships.forEach(ship => {
        expect(ship.imatge_url).toMatch(/^\/assets\/images\/naus\/.*\.png$/);
        expect(ship.imatge_url.length).toBeGreaterThan(0);
      });
      done();
    });
  });
  it('should have unique names for all ships', (done) => {
    service.getShips().subscribe((ships) => {
      const names = ships.map(ship => ship.nom);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(ships.length);
      //verifica que els noms no estan buits
      names.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
      });
      done();
    });
  });
  it('should return an Observable', () => {
    const ships$ = service.getShips();
    expect(ships$).toBeTruthy();
    expect(ships$.subscribe).toBeDefined();
    // Verificar que es un Observable i no un Promise
    expect(ships$ instanceof Observable).toBe(true);
  });
  it('should have positive velocities for all ships', (done) => {
    service.getShips().subscribe((ships) => {
      ships.forEach(ship => {
        expect(ship.velocitat).toBeGreaterThan(0);
        expect(Number.isInteger(ship.velocitat)).toBe(true);
      });
      done();
    });
  });
  
});
