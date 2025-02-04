import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService, GameResult } from './game.service';
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
      temps_total_jugat: 7200,
      punts_totals: 2500
    };

    service.getUserStats().subscribe(stats => {
      expect(stats).toEqual(expectedStats);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/stats/user`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('test-token');
    req.flush({ success: true, estadistiques: expectedStats });
  });

  it('should update user ship', () => {
    const shipId = 1;
    const expectedResponse = { success: true };
    
    service.updateUserShip(shipId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/user/ship`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('test-token');
    req.flush(expectedResponse);
  });

  it('should save game results', () => {
    const gameData: GameResult = {
      usuari_id: 1,
      puntuacio: 100,
      duracio_segons: 60,
      nau_utilitzada: 1,
      nivell_dificultat: 'facil',
      obstacles_superats: 0,
      completada: true
    };
    service.saveGameResults(gameData).subscribe();
    const req = httpMock.expectOne(`${service['apiUrl']}/stats/update`);
    expect(req.request.method).toBe('POST');
  });

  it('should get available ships', () => {
    service.getAvailableShips().subscribe();
    const req = httpMock.expectOne(`${service['apiUrl']}/ships`);
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
    const req = httpMock.expectOne(`${service['apiUrl']}/achievements`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('test-token');
    req.flush(expectedAchievements);
  });

  it('should handle error when getting user stats', () => {
    service.getUserStats().subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe('Token invàlid');
      }
    });
    const req = httpMock.expectOne(`${service['apiUrl']}/stats/user`);
    req.flush(
      { message: 'Token invàlid' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should include auth headers when updating ship', () => {
    const shipId = 1;
    service.updateUserShip(shipId).subscribe();
    
    const req = httpMock.expectOne(`${service['apiUrl']}/user/ship`);
    expect(req.request.headers.get('Authorization')).toBe('test-token');
    req.flush({ success: true });
  });

  it('should handle error when saving game results', () => {
    const gameData: GameResult = {
      usuari_id: 1,
      puntuacio: 0,
      duracio_segons: 0,
      nau_utilitzada: 1,
      nivell_dificultat: 'facil',
      obstacles_superats: 0,
      completada: true
    };
    
    service.saveGameResults(gameData).subscribe({
      error: (error) => expect(error).toBeTruthy()
    });
    const req = httpMock.expectOne(`${service['apiUrl']}/stats/update`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle error when getting available ships', () => {
    service.getAvailableShips().subscribe({
      error: (error) => expect(error).toBeTruthy()
    });
    const req = httpMock.expectOne(`${service['apiUrl']}/ships`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle error when getting achievements', () => {
    service.getUserAchievements().subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe('No autoritzat');
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/achievements`);
    req.flush(
      { message: 'No autoritzat' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});
