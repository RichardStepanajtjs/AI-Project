import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { BusinessProfile } from '../../models/business-profile';

@Component({
  selector: 'app-business-profile-detail-page',
  imports: [DatePipe],
  templateUrl: './business-profile-detail-page.html',
  styleUrl: './business-profile-detail-page.css',
})
export class BusinessProfileDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(BusinessProfilesServices);

  profile: BusinessProfile | null = null;
  loading = true;
  error = '';

  ngOnInit() {
    const stateProfile = history.state?.profile as BusinessProfile;
    if (stateProfile?.naam) {
      this.profile = stateProfile;
      this.loading = false;
      return;
    }

    const id = this.route.snapshot.paramMap.get('kbonummer');
    const numId = Number(id);
    if (!id || isNaN(numId)) {
      this.error = 'Bedrijf niet gevonden.';
      this.loading = false;
      return;
    }

    this.service.getBusinessProfileById(numId).subscribe({
      next: (res: any) => {
        this.profile = res.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Bedrijf niet gevonden.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/business-profiles']);
  }
}
