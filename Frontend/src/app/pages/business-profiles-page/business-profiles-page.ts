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

const FAVORITES_KEY = 'business-profile-favorites';

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

  // Search is debounced so not every keystroke triggers a request.
  get zoekterm() { return this._zoekterm; }
  set zoekterm(v: string) { this._zoekterm = v; this.searchInput$.next(v); }

  get sortering() { return this._sortering; }
  set sortering(v: 'nieuwste' | 'oudste') { this._sortering = v; this.resetAndFetch(); }

  favoritesOnly = false;
  private favoriteKbos: Set<string> = new Set();

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
    this.loadFavorites();
    this.fetchPage();
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
  }

  private loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      this.favoriteKbos = new Set(stored ? JSON.parse(stored) : []);
    } catch {
      this.favoriteKbos = new Set();
    }
  }

  private saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...this.favoriteKbos]));
  }

  isFavorite(profile: BusinessProfile): boolean {
    return this.favoriteKbos.has(profile.kbonummer);
  }

  onFavoriteChange(profile: BusinessProfile, isFavorite: boolean) {
    if (isFavorite) {
      this.favoriteKbos.add(profile.kbonummer);
    } else {
      this.favoriteKbos.delete(profile.kbonummer);
    }
    this.saveFavorites();

    // In favorites mode a removed item must disappear from the list immediately.
    if (this.favoritesOnly) {
      this.fetchPage();
    }
  }

  toggleFavoritesOnly(value: boolean) {
    this.favoritesOnly = value;
    this.resetAndFetch();
  }

  private resetAndFetch() {
    this.currentPage = 1;
    this.fetchPage();
  }

  private fetchPage() {
    // Favorites mode without favorites: fetch nothing, show an empty list.
    if (this.favoritesOnly && this.favoriteKbos.size === 0) {
      this.pagedProfiles = [];
      this.filteredCount = 0;
      this.totalPages = 1;
      this.currentPage = 1;
      this.pageStart = 0;
      this.pageEnd = 0;
      this.visiblePageNumbers = [];
      this.errorMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.businessProfilesService.getBusinessProfilesPaged({
      page: this.currentPage,
      pageSize: this.pageSize,
      sector: this._sector,
      search: this._zoekterm,
      sort: this._sortering,
      kbonummers: this.favoritesOnly ? [...this.favoriteKbos] : undefined,
    }).subscribe({
      next: (response: any) => {
        this.pagedProfiles = (response.data ?? []) as BusinessProfile[];
        this.filteredCount = response.total ?? 0;
        this.totalPages = response.totalPages ?? 1;

        // Keep the current page within valid bounds (e.g. after a filter change).
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
