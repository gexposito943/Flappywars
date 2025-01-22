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
    spyOn(registreService, 'getToken').and.returnValue('test-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user stats', () => {
    const expectedStats = {
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: 7200
    };

    service.getUserStats().subscribe(stats => {
      expect(stats).toEqual(expectedStats);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/user/stats`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush(expectedStats);
  });

  it('should update user ship', () => {
    const shipId = 1;
    const expectedResponse = { success: true };
    
    service.updateUserShip(shipId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/user/ship`);
    expect(req.request.method).toBe('PUT');
    req.flush(expectedResponse);
  });

  it('should save game results', () => {
    const gameData = {
      puntuacio: 1500,
      temps_jugat: 180,
      nau_id: 1
    };
    const expectedResponse = { success: true };

    service.saveGameResults(gameData).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/game/save`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(gameData);
    req.flush(expectedResponse);
  });

  it('should get available ships', () => {
    const expectedShips = [{ id: 1, name: 'X-Wing' }];

    service.getAvailableShips().subscribe(ships => {
      expect(ships).toEqual(expectedShips);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/user/ships`);
    expect(req.request.method).toBe('GET');
    req.flush(expectedShips);
  });
  it('should get user achievements', () => {
    const expectedAchievements = [
      { 
        id: 1, 
        nom: 'Primer vol',
        completat: true
      },
      {
        id: 2,
        nom: 'As Espacial',
        completat: false
      }
    ];
    service.getUserAchievements().subscribe(achievements => {
      expect(achievements).toEqual(expectedAchievements);
    });
    const req = httpMock.expectOne(`${service['apiUrl']}/user/achievements`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush(expectedAchievements);
  });
  it('should handle error when getting user stats', () => {
    service.getUserStats().subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe('Token invàlid');
      }
    });
    const req = httpMock.expectOne(`${service['apiUrl']}/user/stats`);
    req.flush(
      { message: 'Token invàlid' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});
