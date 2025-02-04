import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormulariController } from './controllers/formulari.controller';
import { FormulariModel } from './models/formulari.model';

/**
 * Component que mostra el formulari de registre i login
 * Delega la lògica al controlador i només gestiona la UI
 */
@Component({
  selector: 'etiqueta-formulari',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  providers: [FormulariController],
  templateUrl: './formulari.component.html',
  styleUrls: ['./formulari.component.css']
})
export class FormulariComponent implements AfterViewInit, OnInit {
  @ViewChild('signInBtn') signInBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('signUpBtn') signUpBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;

  constructor(private controller: FormulariController) {}

  get model(): FormulariModel {
    return this.controller.getModel();
  }

  ngAfterViewInit() {
    this.setupPanelAnimations();
  }

  onSubmit(): void {
    this.controller.onSubmit();
  }

  handleSignIn(): void {
    this.controller.handleSignIn();
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
}