import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { RegistreService } from './registre.service';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;
  let registreService: RegistreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameService, RegistreService]
    });
    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
    registreService = TestBed.inject(RegistreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return user stats', (done) => {
    service.getUserStats().subscribe(stats => {
      expect(stats.millor_puntuacio).toBe(1000);
      expect(stats.total_partides).toBe(50);
      expect(stats.temps_total_jugat).toBe(7200);
      done();
    });
  });

  it('should get available ships with auth header', () => {
    const mockToken = 'test-token';
    spyOn(registreService, 'getToken').and.returnValue(mockToken);

    service.getAvailableShips().subscribe();

    const req = httpMock.expectOne(`${service['apiUrl']}/user/ships`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.method).toBe('GET');
  });

  it('should update user ship', (done) => {
    service.updateUserShip(1).subscribe(response => {
      expect(response.success).toBeTrue();
      done();
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
  it('should save game results correctly', () => {
    const mockToken = 'test-token';
    spyOn(registreService, 'getToken').and.returnValue(mockToken);
  
    const gameData = {
      puntuacio: 1500,
      temps_jugat: 180,
      nau_id: 1
    };
  
    service.saveGameResults(gameData).subscribe();
  
    const req = httpMock.expectOne(`${service['apiUrl']}/game/save`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(gameData);
  });
});
