import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-prospect',
  imports: [],
  templateUrl: './prospect.html',
  styleUrl: './prospect.css',
})
export class Prospect {
  @Input() prospectName: string = '';
  @Input() prospectDescription: string = '';
  @Input() accuracy: number = 0;
  @Input() isFavorite: boolean = false;
  @Output() cardClick = new EventEmitter<void>();
  @Output() favoriteChange = new EventEmitter<void>();
}
