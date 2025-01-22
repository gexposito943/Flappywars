import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistreService } from '../services/registre.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  loginError: boolean = false;
  registrationError: boolean = false;

  registerForm: FormGroup;

  constructor(
    private router: Router,
    private authService: RegistreService,
    private registreService: RegistreService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

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
    // Resetear errores
    this.registrationError = false;
    
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
        this.registrationError = true;
        return;
    }

    if (this.password !== this.confirmPassword) {
        alert('Les contrasenyes no coincideixen');
        return;
    }

    console.log('Intentando registro con:', { 
        username: this.username, 
        email: this.email 
    });

    this.registreService.register(this.username, this.email, this.password).subscribe({
        next: (response) => {
            console.log('Registro exitoso:', response);
            alert('Registre completat amb èxit! Ara pots iniciar sessió.');
            this.container.nativeElement.classList.remove('sign-up-mode');
            this.clearInputs();
        },
        error: (error) => {
            console.error('Error en el registre:', error);
            this.registrationError = true;

            if (error.error && error.error.error) {
                alert(error.error.error);
            } else {
                alert('Error en el registre');
            }
        }
    });
  }

  clearInputs() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  passwordValidator() {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return this.password.length >= minLength && symbolRegex.test(this.password);
  }

  handleSignIn() {
    // Resetear errores
    this.loginError = false;
    
    if (!this.email || !this.password) {
        this.loginError = true;
        return;
    }

    console.log('Intentando login con:', { email: this.email });

    this.registreService.validateUser(this.email, this.password).subscribe({
        next: (response) => {
            console.log('Login exitoso:', response);
            if (response && response.token) {
                // Guardar el token
                this.registreService.setToken(response.token);
                
                // Guardar datos del usuario si vienen en la respuesta
                if (response.user) {
                    localStorage.setItem('userData', JSON.stringify(response.user));
                }
                
                // Redirigir al dashboard
                this.router.navigate(['/dashboard']);
            }
        },
        error: (error) => {
            console.error('Error al verificar l\'usuari:', error);
            this.loginError = true;
            
            if (error.status === 401) {
                alert('Contrasenya incorrecta');
            } else if (error.status === 404) {
                alert('Usuari no trobat');
            } else {
                alert('Error en iniciar sessió');
            }
        }
    });
  }
  // handleSignInAdmin() {
  //   this.router.navigate(['/formulari-admin']);
  // }

  // Añadir método para verificar si el email ya existe
  async checkEmailExists(email: string): Promise<boolean> {
    try {
        const [users] = await this.authService.checkEmailExists(email).toPromise();
        return users.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
  }

  // Añadir método para verificar si el username ya existe
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
        const [users] = await this.authService.checkUsernameExists(username).toPromise();
        return users.length > 0;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
  }

  ngOnInit() {}
}