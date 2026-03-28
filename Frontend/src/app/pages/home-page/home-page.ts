import { Component } from '@angular/core';
import { PageHeader } from '../../page-components/page-header/page-header';

@Component({
  selector: 'app-home-page',
  imports: [PageHeader],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  amount_prospectlists = 0
  amount_productsForms = 0
  amount_jobForms = 0
}
