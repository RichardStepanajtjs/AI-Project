import { Component, inject } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { LoginService } from '../../services/login/login-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-page',
  imports: [PageHeader, FormsModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css',
})
export class AccountPage {
  private auth = inject(LoginService);
  private router = inject(Router);
  logout() {
    this.auth.logout()
    this.router.navigate(['/login'])
  }
    user = {
    name: 'Jan Vermeersch',
    email: 'jan@bedrijf.be',
    role: 'Admin'
  };

  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  save() {
    console.log('Opgeslagen:', this.user);
  }

  changePassword() {
    if (this.passwords.new !== this.passwords.confirm) {
      console.error('Wachtwoorden komen niet overeen');
      return;
    }
    console.log('Wachtwoord gewijzigd');
  }
}