import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../nav-component/nav-component';
import { LoginService } from '../../services/login/login-service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, NavComponent],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  loginService = inject(LoginService)
}
