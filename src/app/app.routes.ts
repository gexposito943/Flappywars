import { Routes } from '@angular/router';
import { FormulariComponent } from './components/formulari/formulari.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { EstadistiquesComponent } from './components/estadistiques/estadistiques.component';
import { PerfilComponent } from './components/perfil/perfil.component';

export const routes: Routes = [
  { path: '', component: FormulariComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'game',
    loadComponent: () => import('./components/game/game.component').then(m => m.GameComponent)
  },
  {
    path: 'estadistiques',
    component: EstadistiquesComponent,
    canActivate: [AuthGuard],
    title: 'Estadístiques Globals'
  },
  {
    path: 'perfil',
    component: PerfilComponent
  },
  { path: '**', redirectTo: '' }
];
