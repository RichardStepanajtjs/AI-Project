import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login-service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';

  auth = inject(LoginService);
  router = inject(Router);

  onSubmit() {
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {},
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Inloggen mislukt, probeer opnieuw.';
      }
    });
  }
}
