import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeader } from '../../page-components/page-header/page-header';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { ProspectslistService } from '../../services/prospectslist/prospectslist-service';
import { LoginService } from '../../services/login/login-service';

@Component({
  selector: 'app-home-page',
  imports: [PageHeader],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private businessService = inject(BusinessProfilesServices);
  private prospectsService = inject(ProspectslistService);
  private loginService = inject(LoginService);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  role = this.loginService.getRol() ?? 'gebruiker';
  totalBusinessProfiles = 0;
  totalProspectLists = 0;
  loading = true;

  ngOnInit() {
    this.businessService.getAllBusinessProfiles().subscribe({
      next: (res: any) => {
        this.totalBusinessProfiles = (res.data ?? res)?.length ?? 0;
        this.checkDone();
      },
      error: () => this.checkDone()
    });

    this.prospectsService.getProspectLists().subscribe({
      next: (res: any) => {
        this.totalProspectLists = (res.data ?? res)?.length ?? 0;
        this.checkDone();
      },
      error: () => this.checkDone()
    });
  }

  private _doneCount = 0;
  private checkDone() {
    if (++this._doneCount >= 2) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
