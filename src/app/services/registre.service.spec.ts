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

interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
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
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: 'testuser',
        nivel: 1,
        puntosTotales: 0,
        naveActual: 1,
        nombreNave: 'Nave básica'
      }
    };
    
    expect(service.isLoggedIn()).toBeFalse();
    
    service.validateUser('test@test.com', 'password').subscribe((response: AuthResponse) => {
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
        token: 'mock-jwt-token',
        user: {
            id: 1,
            username: 'testuser',
            nivel: 1,
            puntosTotales: 0,
            naveActual: 1,
            nombreNave: 'Nave básica'
        }
    };
    
    httpMock.expectOne('/api/login').flush(mockResponse);
    
    service.validateUser('test@test.com', 'password').subscribe((response: AuthResponse) => {
        expect(response).toEqual(mockResponse);
        done();
    });
  });
  it('should handle invalid JWT token', (done) => {
    service.validateUser('test@test.com', 'wrongpassword').subscribe({
      next: () => {
        done.fail('Should have failed with 401');
      },
      error: (error) => {
        expect(service.getToken()).toBeNull();
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });
  it('should handle successful login', (done) => {
    const loginData = { username: 'test', password: 'test' };
    
    service.validateUser(loginData.username, loginData.password).subscribe(() => {
        expect(true).toBeTruthy();
        done();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
    req.flush({ token: 'test-token' });
  });
});
