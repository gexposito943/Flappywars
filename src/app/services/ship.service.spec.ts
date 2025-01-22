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

  it('should return a list of ships', () => {
    service.getShips().subscribe((ships) => {
      expect(ships.length).toBeGreaterThan(0);
    });
  });
});
