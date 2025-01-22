import { TestBed } from '@angular/core/testing';

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
});
