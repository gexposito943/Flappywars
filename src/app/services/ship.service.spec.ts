import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { ShipService } from './ship.service';
import { RegistreService } from './registre.service';

describe('ShipService', () => {
  let service: ShipService;
  let httpTestingController: HttpTestingController;
  let registreServiceSpy: jasmine.SpyObj<RegistreService>;

  const mockShips = [
    {
      id: 1,
      nom: 'X-Wing',
      velocitat: 1,
      imatge_url: '/assets/images/naus/x-wing.png',
      descripcio: 'Nau de combat versàtil',
      required_points: 0
    },
    {
      id: 2,
      nom: 'TIE Fighter',
      velocitat: 2,
      imatge_url: '/assets/images/naus/tie-fighter.png',
      descripcio: 'Nau de combat imperial',
      required_points: 1000
    },
    {
      id: 3,
      nom: 'Millennium Falcon',
      velocitat: 3,
      imatge_url: '/assets/images/naus/millennium-falcon.png',
      descripcio: 'Nau de contrabandistes',
      required_points: 2500
    }
  ];

  beforeEach(() => {
    registreServiceSpy = jasmine.createSpyObj('RegistreService', ['getToken']);
    registreServiceSpy.getToken.and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ShipService,
        { provide: RegistreService, useValue: registreServiceSpy }
      ]
    });

    service = TestBed.inject(ShipService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of ships', (done) => {
    service.getShips().subscribe((ships) => {
      expect(ships.length).toBeGreaterThan(0);
      expect(ships).toEqual(mockShips);
      done();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    expect(req.request.method).toBe('GET');
    req.flush(mockShips);
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

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
  });

  it('should have ships with increasing velocities', (done) => {
    service.getShips().subscribe((ships) => {
      expect(ships[0].velocitat).toBeLessThan(ships[1].velocitat);
      expect(ships[1].velocitat).toBeLessThan(ships[2].velocitat);
      done();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
  });

  it('should have unique ship IDs', (done) => {
    service.getShips().subscribe((ships) => {
      const ids = ships.map(ship => ship.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ships.length);
      done();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
  });

  it('should have valid image URLs for all ships', (done) => {
    service.getShips().subscribe((ships) => {
      ships.forEach(ship => {
        expect(ship.imatge_url).toMatch(/^\/assets\/images\/naus\/.*\.png$/);
        expect(ship.imatge_url.length).toBeGreaterThan(0);
      });
      done();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
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

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
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

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
  });

  it('should have all required Ship interface properties', (done) => {
    service.getShips().subscribe((ships) => {
      const requiredProperties = ['id', 'nom', 'velocitat', 'imatge_url', 'descripcio'] as const;
      ships.forEach(ship => {
        requiredProperties.forEach(prop => {
          expect(ship[prop as keyof typeof ship]).not.toBeNull();
          expect(ship[prop as keyof typeof ship]).not.toBeUndefined();
        });
      });
      done();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/naus');
    req.flush(mockShips);
  });
});
