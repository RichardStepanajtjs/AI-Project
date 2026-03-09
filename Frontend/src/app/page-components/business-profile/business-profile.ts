import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-business-profile',
  imports: [],
  templateUrl: './business-profile.html',
  styleUrl: './business-profile.css',
})

export class BusinessProfile {
  @Input() companyName: string = '';
  @Input() companyDescription: string = 'Company Description';
  @Input() city: string = '';
  @Input() sector: string = '';
  @Input() date: string = '';
}
