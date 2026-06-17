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

  get scoreColor(): string {
    if (this.accuracy >= 80) return '#22c55e'; // green
    if (this.accuracy >= 60) return '#eab308'; // yellow
    if (this.accuracy >= 40) return '#f59e0b'; // orange
    return '#ef4444';                          // red
  }
}
