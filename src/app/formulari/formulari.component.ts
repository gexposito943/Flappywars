import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistreService } from '../services/registre.service';
@Component({
  selector: 'etiqueta-formulari',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  providers: [],
  templateUrl: './formulari.component.html',
  styleUrls: ['./formulari.component.css']
})
export class FormulariComponent implements AfterViewInit {
  @ViewChild('signInBtn') signInBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('signUpBtn') signUpBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  usernameError: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  confirmPasswordMismatchError: boolean = false;
  passwordRegexError: boolean = false;

  user: any = null;
  loggedIn: boolean = false;

  constructor(
    private router: Router,
    private authService: RegistreService,
    private registreService: RegistreService
  ) {}


  ngAfterViewInit() {
    if (this.signUpBtn && this.container) {
      this.signUpBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.add('sign-up-mode');
      });
    }

    if (this.signInBtn && this.container) {
      this.signInBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.remove('sign-up-mode');
      });
    }
  }

  onSubmit() {
    this.usernameError = false;
    this.emailError = false;
    this.passwordError = false;
    this.confirmPasswordMismatchError = false;
    this.passwordRegexError = false;

    let formValid = true;

    if (!this.username) {
      this.usernameError = true;
      formValid = false;
    }

    if (!this.email) {
      this.emailError = true;
      formValid = false;
    }

    if (!this.password) {
      this.passwordError = true;
      formValid = false;
    } else if (!this.passwordValidator()) {
      this.passwordRegexError = true;
      formValid = false;
    }

    if (!this.confirmPassword) {
      this.passwordError = true;
      formValid = false;
    }

    if (!this.passwordMatchValidator()) {
      this.confirmPasswordMismatchError = true;
      formValid = false;
    }

    if (formValid) {
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (response) => {
          console.log('Registre correcte', response);
          this.container.nativeElement.classList.remove('sign-up-mode');
          this.clearInputs();
        },
        error: (error) => {
          console.error('Error en el registre', error);
          if (error.error.message.includes('ja existeix')) {
            // Manejar usuario duplicado
          }
        }
      });
    }
  }

  clearInputs() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  passwordMatchValidator() {
    return this.password === this.confirmPassword;
  }

  passwordValidator() {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return this.password.length >= minLength && symbolRegex.test(this.password);
  }

  handleSignIn() {
    if (!this.email || !this.password) {
      return;
    }
  
    this.registreService.validateUser(this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.token) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error al verificar l\'usuari:', error);
        if (error.status === 404) {
          // Usuario no encontrado
        } else if (error.status === 401) {
          // Contraseña incorrecta
        }
      }
    });
  }
  // handleSignInAdmin() {
  //   this.router.navigate(['/formulari-admin']);
  // }
}