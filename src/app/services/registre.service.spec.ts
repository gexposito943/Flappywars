import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegistreService } from './registre.service';

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;  
    nom_usuari: string;
    email: string;
    nivell: number;
    punts_totals: number;
    nau_actual: string | null;  
    data_registre: string;
    ultim_acces: string | null;
    estat: 'actiu' | 'inactiu' | 'bloquejat';
    nau?: {
      id: string;
      nom: string;
      imatge_url: string;
    }
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
  const API_URL = 'http://localhost:3000/api/v1';
  const API_ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    CHECK_EMAIL: '/check-email',
    CHECK_USERNAME: '/check-username'
  };

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

    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.REGISTER}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('Hauria de verificar si l\'usuari està registrat', () => {
    const mockToken = 'mock-jwt-token';
    const mockResponse: AuthResponse = { 
      success: true,
      token: mockToken,
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nom_usuari: 'usuariProva',
        email: 'test@test.com',
        nivell: 1,
        punts_totals: 0,
        nau_actual: '123e4567-e89b-12d3-a456-426614174001',
        data_registre: '2024-01-01T00:00:00Z',
        ultim_acces: null,
        estat: 'actiu',
        nau: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          nom: 'X-Wing',
          imatge_url: '/assets/images/naus/x-wing.png'
        }
      }
    };

    service.validateUser('test@test.com', 'contra1234').subscribe((response) => {
      expect(response.token).toBeDefined();
    });

    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.LOGIN}`);
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
        id: '123e4567-e89b-12d3-a456-426614174000',
        nom_usuari: 'usuariProva',
        email: 'test@test.com',
        nivell: 1,
        punts_totals: 0,
        nau_actual: '123e4567-e89b-12d3-a456-426614174001',
        data_registre: '2024-01-01T00:00:00Z',
        ultim_acces: null,
        estat: 'actiu',
        nau: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          nom: 'X-Wing',
          imatge_url: '/assets/images/naus/x-wing.png'
        }
      }
    };
    
    service.validateUser('test@test.com', 'password123').subscribe(() => {
      expect(service.getToken()).toBe(mockToken);
    });
  
    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.LOGIN}`);
    req.flush(mockResponse);
  });
  it('should clear user data on logout', () => {
    const mockUserData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nom_usuari: 'testUser',
      email: 'test@test.com',
      nivell: 1,
      punts_totals: 100,
      nau_actual: null,
      data_registre: '2024-01-01T00:00:00Z',
      ultim_acces: null,
      estat: 'actiu' as const,
      intents_login: 0
    };
    service.setUserData(mockUserData);
    service.logout();
    expect(service.getUserData()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
  it('should correctly report authentication status', (done) => {
    localStorage.clear();
    service.logout();
    
    const mockResponse: AuthResponse = { 
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nom_usuari: 'testuser',
        email: 'test@test.com',
        nivell: 1,
        punts_totals: 0,
        nau_actual: '123e4567-e89b-12d3-a456-426614174001',
        data_registre: '2024-01-01T00:00:00Z',
        ultim_acces: null,
        estat: 'actiu',
        nau: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          nom: 'Nave básica',
          imatge_url: '/assets/images/naus/x-wing.png'
        }
      }
    };
    
    expect(service.isLoggedIn()).toBeFalse();
    
    service.validateUser('test@test.com', 'password').subscribe(() => {
      expect(service.isLoggedIn()).toBeTrue();
      service.logout();
      expect(service.isLoggedIn()).toBeFalse();
      done();
    });

    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.LOGIN}`);
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
    service.login({ token });
    expect(service.getToken()).toBe(token);

  });
  it('should persist user data between page reloads', () => {
    const mockUserData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nom_usuari: 'testUser',
      email: 'test@test.com',
      nivell: 5,
      punts_totals: 1000,
      nau_actual: null,
      data_registre: '2024-01-01T00:00:00Z',
      ultim_acces: null,
      estat: 'actiu' as const,
      intents_login: 0
    };
    service.setUserData(mockUserData);
    const newServiceInstance = TestBed.inject(RegistreService);
    const persistedData = newServiceInstance.getUserData();
    expect(persistedData).toEqual(mockUserData);
  });
  it('should handle successful login', (done) => {
    const loginData = { username: 'test', password: 'test' };
    const mockResponse: AuthResponse = {
      success: true,
      token: 'test-token',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nom_usuari: 'test',
        email: 'test@test.com',
        nivell: 1,
        punts_totals: 0,
        nau_actual: '123e4567-e89b-12d3-a456-426614174001',
        data_registre: '2024-01-01T00:00:00Z',
        ultim_acces: null,
        estat: 'actiu',
        nau: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          nom: 'Nave básica',
          imatge_url: '/assets/images/naus/x-wing.png'
        }
      }
    };
    
    service.validateUser(loginData.username, loginData.password).subscribe(() => {
      expect(service.getToken()).toBe('test-token');
      done();
    });

    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.LOGIN}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  it('should handle successful login with valid JWT', (done) => {
    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nom_usuari: 'testuser',
        email: 'test@test.com',
        nivell: 1,
        punts_totals: 0,
        nau_actual: '123e4567-e89b-12d3-a456-426614174001',
        data_registre: '2024-01-01T00:00:00Z',
        ultim_acces: null,
        estat: 'actiu',
        nau: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          nom: 'Nave básica',
          imatge_url: '/assets/images/naus/x-wing.png'
        }
      }
    };
    
    service.validateUser('test@test.com', 'password').subscribe((response: AuthResponse) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.LOGIN}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
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

    const req = httpMock.expectOne(`${API_URL}${API_ROUTES.LOGIN}`);
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });
});
