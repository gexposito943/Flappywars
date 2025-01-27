import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegistreService } from './registre.service';

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    nivel: number;
    puntosTotales: number;
    naveActual: number;
    nombreNave: string;
  };
}

describe('RegistreService', () => {
  let service: RegistreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistreService]
    });
    service = TestBed.inject(RegistreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('Hauria de registrar un usuari', (done) => {
    const mockResponse = { message: 'Usuari registrat correctament' };
    
    service.register('test', 'test@test.com', 'password123!').subscribe(response => {
      expect(response.message).toBe('Usuari registrat correctament');
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('Hauria de verificar si l\'usuari està registrat', () => {
    const mockToken = 'mock-jwt-token';
    const mockResponse: AuthResponse = { 
      success: true,
      token: mockToken,
      user: {
        id: 1,
        username: 'usuariProva',
        nivel: 1,
        puntosTotales: 0,
        naveActual: 1,
        nombreNave: 'Nau de Combat'
      }
    };
    service.validateUser('usuariTest', 'contra1234').subscribe((response) => {
      expect(response.token).toBeDefined();
    });
    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  afterEach(() => {
    httpMock.verify();
  });
  it('should handle registration errors', (done) => {
    const errorResponse = { 
      status: 400, 
      statusText: 'Bad Request',
      error: { message: 'L\'usuari ja existeix' }
    };
  
    service.register('existingUser', 'test@test.com', 'password123!').subscribe({
      error: (error) => {
        expect(error.error.message).toBe('L\'usuari ja existeix');
        done();
      }
    });
  
    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    req.flush(errorResponse.error, errorResponse);
  });
  it('should store and retrieve token correctly', () => {
    const mockToken = 'mock-jwt-token';
    const mockResponse: AuthResponse = { 
      success: true,
      token: mockToken,
      user: {
        id: 1,
        username: 'usuariProva',
        nivel: 1,
        puntosTotales: 0,
        naveActual: 1,
        nombreNave: 'Nau de Combat'
      }
    };
    
    service.validateUser('testUser', 'password123').subscribe(() => {
      expect(service.getToken()).toBe(mockToken);
    });
  
    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    req.flush(mockResponse);
  });
  it('should clear user data on logout', () => {
    const mockUserData = {
      username: 'testUser',
      nivel: 1,
      puntosTotales: 100
    };
    service.setUserData(mockUserData);
    service.logout();
    expect(service.getUserData()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
  it('should correctly report authentication status', (done) => {
    localStorage.clear();
    service.logout(); // Asegurarse de que no hay sesión activa
    
    const mockResponse: AuthResponse = { 
      success: true,
      token: 'mock-token',
      user: {
        id: 1,
        username: 'usuariProva',
        nivel: 1,
        puntosTotales: 0,
        naveActual: 1,
        nombreNave: 'Nau de Combat'
      }
    };
    
    expect(service.isLoggedIn()).toBeFalse();
    
    service.validateUser('testUser', 'password123').subscribe(() => {
      service.setToken(mockResponse.token);
      expect(service.isLoggedIn()).toBeTrue();
      
      service.logout();
      expect(service.isLoggedIn()).toBeFalse();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    req.flush(mockResponse);
  });
  it('should check if email exists', () => {
    service.checkEmailExists('test@test.com').subscribe();
    const req = httpMock.expectOne(`${service['apiUrl']}/check-email`);
    expect(req.request.method).toBe('POST');
  });
  it('should check if username exists', () => {
    service.checkUsernameExists('testuser').subscribe();
    const req = httpMock.expectOne(`${service['apiUrl']}/check-username`);
    expect(req.request.method).toBe('POST');
  });
  it('should save and set token correctly', () => {
    const token = 'test-token';
    service.setToken(token);
    expect(service.getToken()).toBe(token);
  });
  it('should persist user data between page reloads', () => {
    const mockUserData = {
      username: 'testUser',
      nivel: 5,
      puntosTotales: 1000
    };
    service.setUserData(mockUserData);
    const newServiceInstance = TestBed.inject(RegistreService);
    // Verificar que las dades persisteixen
    const persistedData = newServiceInstance.getUserData();
    expect(persistedData).toEqual(mockUserData);
  });
  it('should handle successful login with valid JWT', (done) => {
    const mockResponse: AuthResponse = { 
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      user: {
        id: 1,
        username: 'testUser',
        nivel: 1,
        puntosTotales: 100,
        naveActual: 1,
        nombreNave: 'X-Wing'
      }
    };
    
    service.validateUser('test@test.com', 'password123').subscribe(response => {
      expect(response.success).toBeTrue();
      expect(response.token).toBeDefined();
      expect(service.getToken()).toContain('Bearer ');
      expect(service.getUserData()).toEqual(mockResponse.user);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  it('should handle invalid JWT token', (done) => {
    const mockResponse = { 
      success: true,
      token: 'invalid-token',
      user: {
        id: 1,
        username: 'testUser'
      }
    };
    
    service.validateUser('test@test.com', 'password123').subscribe(response => {
      expect(service.getToken()).toBeNull();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    req.flush(mockResponse);
  });
});
