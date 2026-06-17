import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Prospect } from '../../page-components/prospect/prospect';
import { PageHeader } from "../../page-components/page-header/page-header";
import { FilterHeader } from '../../page-components/filter-header/filter-header';
import { ProspectslistService } from '../../services/prospectslist/prospectslist-service';
import { FormPayload, FormsService } from '../../services/forms/forms-service';

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
  isGenerating = false;

  sectorFilters: string[] = [
    'Alle sectoren', 'Aankoop', 'Administratie', 'Bouw', 'Communicatie',
    'Creatief', 'Dienstverlening', 'Financieel', 'Gezondheid', 'Horeca en toerisme',
    'Human resources', 'ICT', 'Juridisch', 'Land- en tuinbouw', 'Logistiek en transport',
    'Management', 'Marketing', 'Onderhoud', 'Onderwijs', 'Onderzoek en ontwikkeling',
    'Overheid', 'Productie', 'Techniek', 'Verkoop', 'Andere'
  ];

  geselecteerdeSector = 'Alle sectoren';
  zoekterm = '';
  favoritesOnly = false;

  form = this.fb.group({
    productName: ['', Validators.required],  // required in product mode (default)
    partnerName: [''],
    sector: ['', Validators.required],
    description: [''],
    targetGroup: [''],
    technologies: ['', Validators.required],
    amountOfProspects: ['25', [Validators.required, Validators.min(1), Validators.max(50)]],
  });

  ngOnInit() {
    this.loadFavorites();
    this.prospectsService.getProspectLists().subscribe({
      next: (res: any) => {
        this.alleLijsten = res.data ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  private loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      this.favoriteIds = new Set(stored ? JSON.parse(stored) : []);
    } catch {
      this.favoriteIds = new Set();
    }
  }

  private saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...this.favoriteIds]));
  }

  gemiddeldeAccuracy(lijst: any): number {
    const scores: number[] = lijst?.accuracy_scores ?? [];
    if (!scores.length) return 0;
    const gemiddelde = scores.reduce((som, s) => som + s, 0) / scores.length;
    return Math.round(gemiddelde);
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
      .filter(l => !this.zoekterm || (l.naam ?? '').toLowerCase().includes(this.zoekterm.toLowerCase()))
      .filter(l => !this.favoritesOnly || this.isFavorite(l));
  }

  openForm() { this.showForm = true; }
  closeForm() {
    this.showForm = false;
    this.isJobMode = false;
    this.form.reset({ amountOfProspects: '25' });
    // Reset validators back to product mode defaults
    this.form.get('productName')!.setValidators([Validators.required]);
    this.form.get('partnerName')!.clearValidators();
    this.form.get('productName')!.updateValueAndValidity();
    this.form.get('partnerName')!.updateValueAndValidity();
  }

  toggleMode() {
    this.isJobMode = !this.isJobMode;
    const productCtrl = this.form.get('productName')!;
    const partnerCtrl = this.form.get('partnerName')!;
    if (this.isJobMode) {
      partnerCtrl.setValidators([Validators.required]);
      productCtrl.clearValidators();
    } else {
      productCtrl.setValidators([Validators.required]);
      partnerCtrl.clearValidators();
    }
    productCtrl.updateValueAndValidity();
    partnerCtrl.updateValueAndValidity();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    const payload: FormPayload = {
      partner_name: this.isJobMode ? (v.partnerName || 'Onbekend') : (v.productName || 'Onbekend'),
      sector: v.sector ?? '',
      description: v.description ?? '',
      technologies: (v.technologies ?? '').split(',').map((t: string) => t.trim()),
      amount_of_prospects: Number(v.amountOfProspects),
      is_job: this.isJobMode
    };

    this.isGenerating = true;

    this.formService.createForm(payload).subscribe({
      next: (response: any) => {
        const formId = response?.data?.id;

        if (!formId) {
          this.isGenerating = false;
          this.refreshList();
          this.closeForm();
          return;
        }

        // Start de volledige pipeline (Ollama herformulering + Voyage embedding)
        this.formService.processForm(formId).subscribe({
          next: () => {
            this.isGenerating = false;
            this.refreshList();
            this.closeForm();
          },
          error: (err) => {
            // Processing is mislukt maar de form is wel opgeslagen
            console.error('Form processing fout:', err);
            this.isGenerating = false;
            this.refreshList();
            this.closeForm();
          }
        });
      },
      error: (err) => {
        console.error('Database schrijf-fout:', err);
        this.isGenerating = false;
        alert('Er ging iets mis bij het opslaan.');
      }
    });
  }
  private refreshList() {
  this.prospectsService.getProspectLists().subscribe({
    next: (res: any) => {
      this.alleLijsten = res.data ?? res ?? [];
      this.cdr.detectChanges();
    }
  });
}
}
