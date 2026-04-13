import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Prospect } from '../../page-components/prospect/prospect';
import { PageHeader } from "../../page-components/page-header/page-header";
import { FilterHeader } from '../../page-components/filter-header/filter-header';
import { ProspectslistService } from '../../services/prospectslist/prospectslist-service';
import { FormsService } from '../../services/forms/forms-service';

const FAVORITES_KEY = 'prospect-favorites';

@Component({
  selector: 'app-prospects-page',
  imports: [Prospect, PageHeader, FilterHeader, ReactiveFormsModule],
  templateUrl: './prospects-page.html',
  styleUrl: './prospects-page.css',
})
export class ProspectsPage {
  private prospectsService = inject(ProspectslistService);
  public router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private formService = inject(FormsService)

  alleLijsten: any[] = [];
  favoriteIds: Set<string | number> = new Set();
  showForm = false;
  isJobMode = false;

  sectorFilters: string[] = [
    'Alle sectoren', 'Aankoop', 'Administratie', 'Bouw', 'Communicatie',
    'Creatief', 'Dienstverlening', 'Financieel', 'Gezondheid', 'Horeca en toerisme',
    'Human resources', 'ICT', 'Juridisch', 'Land- en tuinbouw', 'Logistiek en transport',
    'Management', 'Marketing', 'Onderhoud', 'Onderwijs', 'Onderzoek en ontwikkeling',
    'Overheid', 'Productie', 'Techniek', 'Verkoop', 'Andere'
  ];

  geselecteerdeSector = 'Alle sectoren';
  zoekterm = '';

  form = this.fb.group({
    productName: ['', Validators.required],
    partnerName: ['', Validators.required],
    sector: ['', Validators.required],
    description: [''],
    targetGroup: [''],
    technologies: ['', Validators.required],
    amountOfProspects: ['25', [Validators.required, Validators.min(1), Validators.max(50)]],
  });

  ngOnInit() {
    this.loadFavorites();
    this.prospectsService.getProspects().subscribe({
      next: (res: any) => {
        this.alleLijsten = res.data ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  private loadFavorites() {
    try {
      const stored = sessionStorage.getItem(FAVORITES_KEY);
      this.favoriteIds = new Set(stored ? JSON.parse(stored) : []);
    } catch {
      this.favoriteIds = new Set();
    }
  }

  private saveFavorites() {
    sessionStorage.setItem(FAVORITES_KEY, JSON.stringify([...this.favoriteIds]));
  }

  isFavorite(lijst: any): boolean {
    return this.favoriteIds.has(lijst.id);
  }

  toggleFavorite(lijst: any) {
    if (this.favoriteIds.has(lijst.id)) {
      this.favoriteIds.delete(lijst.id);
    } else {
      this.favoriteIds.add(lijst.id);
    }
    this.saveFavorites();
  }

  get gefilterdeLijsten() {
    if (!this.alleLijsten || !Array.isArray(this.alleLijsten)) return [];
    return this.alleLijsten
      .filter(l => this.geselecteerdeSector === 'Alle sectoren' || l.jobdomein === this.geselecteerdeSector)
      .filter(l => !this.zoekterm || (l.naam ?? '').toLowerCase().includes(this.zoekterm.toLowerCase()));
  }

  openForm() { this.showForm = true; }
  closeForm() { this.showForm = false; this.form.reset({ amountOfProspects: '25' }); }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    const payload = {
      partner_name: this.isJobMode ? (v.partnerName ?? '') : (v.productName ?? ''),
      sector: v.sector ?? '',
      description: v.description ?? '',
      target_group: v.targetGroup ?? '',
      technologies: (v.technologies ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
      amount_of_prospects: Number(v.amountOfProspects ?? 25),
      is_job: this.isJobMode,
    };

    this.formService.createForm(payload).subscribe({
      next: () => {
        // this.prospectsService.getProspects().subscribe({
        //   next: (res: any) => {
        //     this.alleLijsten = res.data ?? res ?? [];
        //     this.cdr.detectChanges();
        //   }
        // });
      },
      error: (err) => console.error(err)
    });
  }
}
