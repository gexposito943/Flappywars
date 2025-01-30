import { Routes } from '@angular/router';
import { FormulariComponent } from './formulari/formulari.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { EstadistiquesComponent } from './estadistiques/estadistiques.component';

export const routes: Routes = [
  { path: '', component: FormulariComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'game',
    loadComponent: () => import('./game/game.component').then(m => m.GameComponent)
  },
  {
    path: 'estadistiques',
    component: EstadistiquesComponent,
    canActivate: [AuthGuard],
    title: 'Estadístiques Globals'
  },
  { path: '**', redirectTo: '' }
];
