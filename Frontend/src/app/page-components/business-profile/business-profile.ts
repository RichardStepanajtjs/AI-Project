import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-business-profile',
  imports: [],
  templateUrl: './business-profile.html',
  styleUrl: './business-profile.css',
})

export class BusinessProfileComponent {
  @Input() companyName: string = ''
  @Input() province: string = ''
  @Input() countryCode: string = ''
  @Input() jobDomain: string = ''
}
