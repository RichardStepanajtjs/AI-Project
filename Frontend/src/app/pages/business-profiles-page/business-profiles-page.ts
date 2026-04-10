import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { BusinessProfileComponent } from '../../page-components/business-profile/business-profile';
import { FilterHeader } from '../../page-components/filter-header/filter-header';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { Router } from '@angular/router';
import { BusinessProfile } from '../../models/business-profile';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-profiles-page',
  imports: [PageHeader, BusinessProfileComponent, FilterHeader, FormsModule],
  templateUrl: './business-profiles-page.html',
  styleUrl: './business-profiles-page.css',
})
export class BusinessProfilesPage {
  sectorFilters = [
    'Alle sectoren', 'Aankoop', 'Administratie', 'Bouw', 'Communicatie',
    'Creatief', 'Dienstverlening', 'Financieel', 'Gezondheid', 'Horeca en toerisme',
    'Human resources', 'ICT', 'Juridisch', 'Land- en tuinbouw', 'Logistiek en transport',
    'Management', 'Marketing', 'Onderhoud', 'Onderwijs', 'Onderzoek en ontwikkeling',
    'Overheid', 'Productie', 'Techniek', 'Verkoop', 'Andere'
  ];

  private _sector = 'Alle sectoren';
  private _zoekterm = '';

  get geselecteerdeSector() { return this._sector; }
  set geselecteerdeSector(v: string) { this._sector = v; this.resetPagination(); }

  get zoekterm() { return this._zoekterm; }
  set zoekterm(v: string) { this._zoekterm = v; this.resetPagination(); }

  businessProfiles: BusinessProfile[] = [];
  errorMessage = '';

  currentPage = 1;
  private _pageSize = 20;
  pageSizeOptions = [10, 20, 50, 100];

  pagedProfiles: BusinessProfile[] = [];
  filteredCount = 0;
  totalPages = 1;
  pageStart = 1;
  pageEnd = 0;
  visiblePageNumbers: number[] = [];

  businessProfilesService = inject(BusinessProfilesServices);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  get pageSize() { return this._pageSize; }
  set pageSize(v: number) { this._pageSize = v; this.resetPagination(); }

  ngOnInit() {
    this.businessProfilesService.getAllBusinessProfiles().subscribe({
      next: (response: any) => {
        this.businessProfiles = [...response.data] as BusinessProfile[];
        this.computePage();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij het laden van bedrijven.';
      }
    });
  }

  private resetPagination() {
    this.currentPage = 1;
    this.computePage();
  }

  private computePage() {
    const filtered = this.businessProfiles
      .filter(p => this._sector === 'Alle sectoren' || p.jobdomein === this._sector)
      .filter(p => !this._zoekterm || p.naam.toLowerCase().includes(this._zoekterm.toLowerCase()));

    this.filteredCount = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this._pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    const start = (this.currentPage - 1) * this._pageSize;
    const end = Math.min(start + this._pageSize, filtered.length);
    this.pagedProfiles = filtered.slice(start, end);
    this.pageStart = filtered.length === 0 ? 0 : start + 1;
    this.pageEnd = end;

    const pages: number[] = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
      pages.push(i);
    }
    this.visiblePageNumbers = pages;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.computePage();
  }

  prevPage() { this.goToPage(this.currentPage - 1); }
  nextPage() { this.goToPage(this.currentPage + 1); }
}
