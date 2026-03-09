import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-component',
  imports: [RouterLink],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent {
  @Input() link: string = '';
  @Input() isAdmin: boolean = false;
  @Input() label: string = '';
}
