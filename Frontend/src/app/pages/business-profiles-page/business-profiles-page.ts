import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { BusinessProfileComponent } from '../../page-components/business-profile/business-profile';
import { FilterHeader } from '../../page-components/filter-header/filter-header';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { Router } from '@angular/router';
import { BusinessProfile } from '../../models/business-profile';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-business-profiles-page',
  imports: [PageHeader, BusinessProfileComponent, FilterHeader, FormsModule],
  templateUrl: './business-profiles-page.html',
  styleUrl: './business-profiles-page.css',
})
export class BusinessProfilesPage implements OnDestroy {
  sectorFilters = [
    'Alle sectoren', 'Aankoop', 'Administratie', 'Bouw', 'Communicatie',
    'Creatief', 'Dienstverlening', 'Financieel', 'Gezondheid', 'Horeca en toerisme',
    'Human resources', 'ICT', 'Juridisch', 'Land- en tuinbouw', 'Logistiek en transport',
    'Management', 'Marketing', 'Onderhoud', 'Onderwijs', 'Onderzoek en ontwikkeling',
    'Overheid', 'Productie', 'Techniek', 'Verkoop', 'Andere'
  ];

  sorteerOpties = [
    { label: 'Nieuwste eerst', value: 'nieuwste' },
    { label: 'Oudste eerst', value: 'oudste' },
  ];

  private _sector = 'Alle sectoren';
  private _zoekterm = '';
  private _sortering: 'nieuwste' | 'oudste' = 'nieuwste';

  get geselecteerdeSector() { return this._sector; }
  set geselecteerdeSector(v: string) { this._sector = v; this.resetAndFetch(); }

  // Zoeken wordt gedebounced zodat niet elke toetsaanslag een request veroorzaakt.
  get zoekterm() { return this._zoekterm; }
  set zoekterm(v: string) { this._zoekterm = v; this.searchInput$.next(v); }

  get sortering() { return this._sortering; }
  set sortering(v: 'nieuwste' | 'oudste') { this._sortering = v; this.resetAndFetch(); }

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

  private searchInput$ = new Subject<string>();
  private searchSub: Subscription;

  businessProfilesService = inject(BusinessProfilesServices);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  get pageSize() { return this._pageSize; }
  set pageSize(v: number) { this._pageSize = Number(v); this.resetAndFetch(); }

  constructor() {
    this.searchSub = this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.resetAndFetch());
  }

  ngOnInit() {
    this.fetchPage();
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
  }

  private resetAndFetch() {
    this.currentPage = 1;
    this.fetchPage();
  }

  private fetchPage() {
    this.businessProfilesService.getBusinessProfilesPaged({
      page: this.currentPage,
      pageSize: this.pageSize,
      sector: this._sector,
      search: this._zoekterm,
      sort: this._sortering,
    }).subscribe({
      next: (response: any) => {
        this.pagedProfiles = (response.data ?? []) as BusinessProfile[];
        this.filteredCount = response.total ?? 0;
        this.totalPages = response.totalPages ?? 1;

        // Houd de huidige pagina binnen de geldige grenzen (bv. na een filterwissel).
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }

        const start = (this.currentPage - 1) * this.pageSize;
        this.pageStart = this.filteredCount === 0 ? 0 : start + 1;
        this.pageEnd = start + this.pagedProfiles.length;

        this.computeVisiblePages();
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij het laden van bedrijven.';
        this.cdr.detectChanges();
      }
    });
  }

  private computeVisiblePages() {
    const pages: number[] = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
      pages.push(i);
    }
    this.visiblePageNumbers = pages;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.fetchPage();
  }

  prevPage() { this.goToPage(this.currentPage - 1); }
  nextPage() { this.goToPage(this.currentPage + 1); }
}
