import { Component, inject } from '@angular/core';
import { LoginService } from '../../services/login/login-service';
import { ThemeService, Theme } from '../../services/theme/theme-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../page-components/page-header/page-header';

type Tab = 'profiel' | 'beveiliging' | 'weergave';

@Component({
  selector: 'app-account-page',
  imports: [FormsModule, PageHeader],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css',
})
export class AccountPage {
  private auth = inject(LoginService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  activeTab: Tab = 'profiel';

  user = {
    name: 'John Doe',
    email: 'email@comingsoon.com',
    role: this.auth.getRol() ?? 'gebruiker'
  };

  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  passwordError = '';
  passwordSuccess = '';

  activeTheme: Theme = this.themeService.current();

  themes: { id: Theme; label: string; description: string; preview: string[] }[] = [
    { id: 'light', label: 'Licht',  description: 'Helder', preview: ['#F7F6F2', '#FFFFFF', '#2D6A4F'] },
    { id: 'dark',  label: 'Donker', description: 'Donkere thema makkelijk voor de ogen.', preview: ['#111110', '#1C1C1A', '#52B788'] },
  ];

  setTab(tab: Tab) {
    this.activeTab = tab;
  }

  setTheme(theme: Theme) {
    this.activeTheme = theme;
    this.themeService.apply(theme);
  }

  save() {
    console.log('Opgeslagen:', this.user);
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';
    
    if (!this.passwords.current) {
      this.passwordError = 'Voer je huidige wachtwoord in.'; 
      return;
    }

    if (this.passwords.new.length < 8) { 
      this.passwordError = 'Nieuw wachtwoord moet minstens 8 tekens bevatten.';
      return;
    }

    if (this.passwords.new !== this.passwords.confirm) {
      this.passwordError = 'Wachtwoorden komen niet overeen.';
      return;
    }

    this.passwordSuccess = 'Wachtwoord succesvol gewijzigd.';
    this.passwords = { current: '', new: '', confirm: '' };
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get initials(): string {
    return this.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
