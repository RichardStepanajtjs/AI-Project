import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { LoginService } from '../../services/login/login-service';
import { UsersService } from '../../services/users/users-service';
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
export class AccountPage implements OnInit {
  private auth = inject(LoginService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);

  private userId: number | null = null;

  activeTab: Tab = 'profiel';

  user = {
    name: '',
    email: '',
    role: this.auth.getRol() ?? 'gebruiker'
  };

  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  profileError = '';
  profileSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  activeTheme: Theme = this.themeService.current();

  themes: { id: Theme; label: string; description: string; preview: string[] }[] = [
    { id: 'light', label: 'Licht',  description: 'Helder', preview: ['#F7F6F2', '#FFFFFF', '#2D6A4F'] },
    { id: 'dark',  label: 'Donker', description: 'Donkere thema makkelijk voor de ogen.', preview: ['#111110', '#1C1C1A', '#52B788'] },
  ];

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    if (this.userId) {
      this.usersService.getUserById(this.userId).subscribe({
        next: (res: any) => {
          const user = res.data;
          this.user.name = user.naam ?? '';
          this.user.email = user.email ?? '';
          this.user.role = user.role ?? this.auth.getRol() ?? 'gebruiker';
          this.cdr.detectChanges();
        },
        error: () => {
          this.user.email = this.auth.getEmail() ?? '';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.user.email = this.auth.getEmail() ?? '';
    }
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
  }

  setTheme(theme: Theme) {
    this.activeTheme = theme;
    this.themeService.apply(theme);
  }

  save() {
    if (!this.userId) return;
    this.profileError = '';
    this.profileSuccess = '';

    this.usersService.updateUser(this.userId, { email: this.user.email, naam: this.user.name }).subscribe({
      next: () => {
        this.profileSuccess = 'Profiel succesvol opgeslagen.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 409) {
          this.profileError = 'Dit e-mailadres is al in gebruik.';
        } else {
          this.profileError = 'Er is iets misgegaan bij het opslaan.';
        }
        this.cdr.detectChanges();
      }
    });
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

    if (!this.userId) return;

    this.usersService.changePassword(this.userId, {
      currentPassword: this.passwords.current,
      newPassword: this.passwords.new
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Wachtwoord succesvol gewijzigd.';
        this.passwords = { current: '', new: '', confirm: '' };
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.passwordError = 'Huidig wachtwoord is onjuist.';
        } else {
          this.passwordError = 'Er is iets misgegaan bij het wijzigen van het wachtwoord.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get initials(): string {
    const name = this.user.name || this.user.email;
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
