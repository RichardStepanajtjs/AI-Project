import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { BusinessProfileComponent } from '../../page-components/business-profile/business-profile';
import { FilterHeader } from '../../page-components/filter-header/filter-header';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { Router } from '@angular/router';
import { BusinessProfile } from '../../models/business-profile';

@Component({
  selector: 'app-business-profiles-page',
  imports: [PageHeader, BusinessProfileComponent, FilterHeader],
  templateUrl: './business-profiles-page.html',
  styleUrl: './business-profiles-page.css',
})
export class BusinessProfilesPage {
  sectorFilters = ['Alle sectoren', 'test', 'test2', 'test3'];
  geselecteerdeSector = 'Alle sectoren';

  businessProfiles = [] as BusinessProfile[]

  showScreen: boolean = false;
  errorMessage = '';
  businessProfilesService = inject(BusinessProfilesServices);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  new_profile = {} as BusinessProfile;

  ngOnInit() {
    this.businessProfilesService.getAllBusinessProfiles().subscribe({
      next: (response: any) => {
        this.businessProfiles = [...response.data] as BusinessProfile[];
        this.cdr.detectChanges();
        console.log(response.data);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij het laden van gebruikers.';
      }
    });
  }
}
