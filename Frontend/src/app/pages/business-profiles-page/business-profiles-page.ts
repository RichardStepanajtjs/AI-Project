import { Component } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { BusinessProfile } from '../../page-components/business-profile/business-profile';
import { FilterHeader } from '../../page-components/filter-header/filter-header';

@Component({
  selector: 'app-business-profiles-page',
  imports: [PageHeader, BusinessProfile, FilterHeader],
  templateUrl: './business-profiles-page.html',
  styleUrl: './business-profiles-page.css',
})
export class BusinessProfilesPage {
  sectorFilters = ['Alle sectoren', 'test', 'test2', 'test3'];
  geselecteerdeSector = 'Alle sectoren';

}
