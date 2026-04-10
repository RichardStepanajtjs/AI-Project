import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-business-profile',
  imports: [],
  templateUrl: './business-profile.html',
  styleUrl: './business-profile.css',
})
export class BusinessProfileComponent {
  @Input() companyName: string = '';
  @Input() province: string = '';
  @Input() countryCode: string = '';
  @Input() jobDomain: string = '';
  @Input() kbonummer: string = '';
  @Input() isFavorite: boolean = false;
  @Output() favoriteChange = new EventEmitter<boolean>();
  @Output() cardClick = new EventEmitter<void>();

  toggleFavorite(event: MouseEvent) {
      event.stopPropagation();
      this.isFavorite = !this.isFavorite;
      this.favoriteChange.emit(this.isFavorite);
  }
}