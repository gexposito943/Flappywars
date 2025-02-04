import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormulariController } from './controllers/formulari.controller';
import { FormulariModel } from './models/formulari.model';

/**
 * Component que mostra el formulari de registre i login
 * Delega la lògica al controlador i només gestiona la UI
 */
@Component({
  selector: 'etiqueta-formulari',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, CommonModule],
  providers: [FormulariController],
  templateUrl: './formulari.component.html',
  styleUrls: ['./formulari.component.css']
})
export class FormulariComponent implements AfterViewInit, OnInit {
  @ViewChild('signInBtn') signInBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('signUpBtn') signUpBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;

  registerForm: FormGroup;
  loginForm: FormGroup;
  isSignUpMode: boolean = false;
  email: string = '';
  password: string = '';

  constructor(
    public controller: FormulariController,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get model(): FormulariModel {
    return this.controller.getModel();
  }

  ngAfterViewInit() {
    this.setupPanelAnimations();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.controller.getModel().setUsername(this.registerForm.get('username')?.value);
      this.controller.getModel().setEmail(this.registerForm.get('email')?.value);
      this.controller.getModel().setPassword(this.registerForm.get('password')?.value);
      
      this.controller.onSubmit();
    }
  }

  handleSignIn(): void {
    if (this.loginForm.valid) {
      this.controller.getModel().setEmail(this.loginForm.get('email')?.value);
      this.controller.getModel().setPassword(this.loginForm.get('password')?.value);
      
      this.controller.handleSignIn();
    }
  }

  private setupPanelAnimations(): void {
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

  ngOnInit() {}

  getPasswordErrorMessage(): string {
    const password = this.registerForm.get('password');
    if (password?.hasError('required') || password?.hasError('minlength')) {
      return 'La contrasenya ha de tenir mínim 6 caràcters i un símbol especial';
    }
    return '';
  }

  toggleMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
    const container = document.querySelector('.container');
    if (container) {
      container.classList.toggle('sign-up-mode', this.isSignUpMode);
    }
  }
}