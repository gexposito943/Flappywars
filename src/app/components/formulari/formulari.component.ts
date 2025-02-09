import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistreService } from '../../services/registre.service';
import { User } from './models/user.model';
import { userLogin } from './models/userLogin.model';

/**
 * Component que mostra el formulari de registre i login
 * Delega la lògica al controlador i només gestiona la UI
 */
@Component({
  selector: 'etiqueta-formulari',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  providers: [],
  templateUrl: './formulari.component.html',
  styleUrls: ['./formulari.component.css']
})
export class FormulariComponent implements AfterViewInit, OnInit {
  @ViewChild('signInBtn') signInBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('signUpBtn') signUpBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;

  registerUser = new User();
  loginCredentials = new userLogin();
  isSignUpMode = false;
  showRegisterErrors = false;
  showLoginErrors = false;
  showSuccessPopup = false;

  constructor(
    private router: Router,
    private registreService: RegistreService
  ) {}

  ngOnInit(): void {
    this.registreService.logout();
  }

  ngAfterViewInit() {
    this.setupButtonListeners();
  }

  private setupButtonListeners(): void {
    if (this.signUpBtn && this.container) {
      this.signUpBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.add('sign-up-mode');
        this.showRegisterErrors = false;
        this.showLoginErrors = false;
      });
    }

    if (this.signInBtn && this.container) {
      this.signInBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.remove('sign-up-mode');
        this.showRegisterErrors = false;
        this.showLoginErrors = false;
      });
    }
  }

  onSubmit(): void {
    this.showRegisterErrors = true;
    const { isValid } = this.registerUser.validate();
    
    if (isValid) {
      this.registreService.register(
        this.registerUser.username,
        this.registerUser.email,
        this.registerUser.password
      ).subscribe({
        next: () => {
          this.showSuccessPopup = true;
          this.registerUser.clear();
          this.showRegisterErrors = false;
          setTimeout(() => {
            this.showSuccessPopup = false;
            this.container.nativeElement.classList.remove('sign-up-mode');
          }, 2000);
        },
        error: (error) => {
          console.error('Error en el registre:', error);
          if (error.error?.error) {
            alert(error.error.error);
          } else {
            alert('Error en el registre');
          }
        }
      });
    }
  }

  handleSignIn(): void {
    this.showLoginErrors = true;
    const { isValid } = this.loginCredentials.validate();
    
    if (isValid) {
      this.registreService.validateUser(
        this.loginCredentials.email,
        this.loginCredentials.password
      ).subscribe({
        next: (response) => {
          if (response.success && response.token) {
            this.registreService.login(response);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          if (error.status === 401) {
            alert('Credencials incorrectes');
          } else {
            alert('Error en l\'inici de sessió');
          }
        }
      });
    }
  }

  toggleMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
    this.showRegisterErrors = false;
    this.showLoginErrors = false;
    if (this.container) {
      this.container.nativeElement.classList.toggle('sign-up-mode', this.isSignUpMode);
    }
  }
}