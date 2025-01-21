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
});
