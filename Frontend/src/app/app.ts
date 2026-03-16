import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navigation } from './page-components/navigation/navigation';
import { LoginService } from './services/login/login-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  auth = inject(LoginService);
  isLoggedIn = this.auth.isLoggedIn;
}
