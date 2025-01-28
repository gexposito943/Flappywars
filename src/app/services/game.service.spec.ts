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

    const req = httpMock.expectOne('http://localhost:3000/api/stats');
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

    const req = httpMock.expectOne('http://localhost:3000/api/updateShip');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush(expectedResponse);
  });

  it('should save game results', () => {
    const gameData = {
      puntuacio: 100,
      temps_jugat: 60,
      nau_id: 1
    };
    service.saveGameResults(gameData).subscribe();
    const req = httpMock.expectOne('http://localhost:3000/api/game/save');
    expect(req.request.method).toBe('POST');
  });

  it('should get available ships', () => {
    service.getAvailableShips().subscribe();
    const req = httpMock.expectOne('http://localhost:3000/api/user/ships');
    expect(req.request.method).toBe('GET');
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
    const req = httpMock.expectOne('http://localhost:3000/api/achievements');
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
    const req = httpMock.expectOne('http://localhost:3000/api/stats');
    req.flush(
      { message: 'Token invàlid' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should include auth headers when updating ship', () => {
    const shipId = 1;
    service.updateUserShip(shipId).subscribe();
    
    const req = httpMock.expectOne('http://localhost:3000/api/updateShip');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ success: true });
  });

  it('should handle error when saving game results', () => {
    service.saveGameResults({ puntuacio: 0, temps_jugat: 0, nau_id: 1 }).subscribe({
      error: (error) => expect(error).toBeTruthy()
    });
    const req = httpMock.expectOne('http://localhost:3000/api/game/save');
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle error when getting available ships', () => {
    service.getAvailableShips().subscribe({
      error: (error) => expect(error).toBeTruthy()
    });
    const req = httpMock.expectOne('http://localhost:3000/api/user/ships');
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle error when getting achievements', () => {
    service.getUserAchievements().subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe('No autorizado');
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/api/achievements');
    req.flush(
      { message: 'No autorizado' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});
