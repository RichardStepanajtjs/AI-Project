import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../nav-component/nav-component';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, NavComponent],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {

}
