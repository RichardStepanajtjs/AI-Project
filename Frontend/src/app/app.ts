import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Navigation } from './page-components/navigation/navigation';
import { LoginService } from './services/login/login-service';
import { ThemeService } from './services/theme/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  auth = inject(LoginService);
  router = inject(Router);
  isLoggedIn = this.auth.isLoggedIn;

  constructor() {
    inject(ThemeService).init();
  }
}
