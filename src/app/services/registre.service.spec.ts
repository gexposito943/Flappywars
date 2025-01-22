import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegistreService } from './registre.service';

interface AuthResponse {
  token: string;
  user?: any; 
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
    const mockResponse: AuthResponse = { token: 'mock-token' };
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
    const mockResponse: AuthResponse = { token: mockToken };
    
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
});
