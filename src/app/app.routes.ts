import { Routes } from '@angular/router';
import { FormulariComponent } from './formulari/formulari.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { GameComponent } from './game/game.component';

export const routes: Routes = [
  { path: '', component: FormulariComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'game', component: GameComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
