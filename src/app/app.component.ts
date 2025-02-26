import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistreService } from './services/registre.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Flappywars';
  constructor(private registreService: RegistreService) {}
  ngOnInit() {
    if (this.registreService.isLoggedIn()) {
      console.log('Usuari loguejat, programant renovació del token');
      this.registreService.scheduleTokenRefresh();
    }
  }
}
