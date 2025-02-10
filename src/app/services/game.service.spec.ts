import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { RegistreService } from './registre.service';
import { Partida, Nau, Estadistica } from '../models';

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
    const userId = '1';
    const expectedStats = new Estadistica();
    expectedStats.millor_puntuacio = 1000;
    expectedStats.total_partides = 50;
    expectedStats.temps_total_jugat = 7200;
    expectedStats.punts_totals = 2500;

    service.getUserStats(userId).subscribe(response => {
      expect(response.data).toEqual(expectedStats);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/stats/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: expectedStats });
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
    const gameData = new Partida();
    gameData.usuari_id = '1';
    gameData.puntuacio = 100;
    gameData.duracio_segons = 60;
    gameData.nau_utilitzada = 'nau-1';
    gameData.obstacles_superats = 5;
    gameData.completada = 1;

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
      new Estadistica(1000, 50, 7200, 2500),
      new Estadistica(500, 25, 3600, 1200)
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
    service.getUserStats('1').subscribe({
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
    const gameData = new Partida();
    gameData.usuari_id = '1';
    gameData.puntuacio = 100;
    gameData.duracio_segons = 60;
    gameData.nau_utilitzada = 'nau-1';
    gameData.obstacles_superats = 5;
    gameData.completada = 1;
    
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

  it('should get default ship', () => {
    const expectedShip = new Nau();
    expectedShip.id = 'uuid-1';
    expectedShip.nom = 'X-Wing';
    expectedShip.velocitat = 1;
    expectedShip.imatge_url = '/assets/images/naus/x-wing.png';
    expectedShip.descripcio = 'Nau inicial perfecta per començar';
    expectedShip.disponible = true;

    service.getNau().subscribe(ship => {
      expect(ship).toEqual(expectedShip);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/naus/default`);
    expect(req.request.method).toBe('GET');
    req.flush(expectedShip);
  });
});
