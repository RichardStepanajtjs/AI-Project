import { Component, Input } from '@angular/core';

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
  @Input() city: string = 'city';
  @Input() sector: string = 'sector';
}
