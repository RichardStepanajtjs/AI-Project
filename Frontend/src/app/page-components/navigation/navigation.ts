import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavComponent } from '../nav-component/nav-component';
import { LoginService } from '../../services/login/login-service';

@Component({
  selector: 'app-navigation',
  host: { '[class.collapsed]': 'collapsed' },
  imports: [RouterLink, RouterLinkActive, NavComponent],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  loginService = inject(LoginService);
  collapsed = false;

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
