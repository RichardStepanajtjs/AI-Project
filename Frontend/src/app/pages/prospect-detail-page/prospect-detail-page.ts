import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProspectslistService } from '../../services/prospectslist/prospectslist-service';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { PageHeader } from '../../page-components/page-header/page-header';

@Component({
  selector: 'app-prospect-detail-page',
  imports: [PageHeader, FormsModule],
  templateUrl: './prospect-detail-page.html',
  styleUrl: './prospect-detail-page.css',
})
export class ProspectDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProspectslistService);
  private companiesService = inject(BusinessProfilesServices);
  private cdr = inject(ChangeDetectorRef);

  prospect: any = null;
  connectedProfiles: any[] = [];
  loading = true;
  error = '';
  sortOrder = 'accuracy-desc';

  ngOnInit() {
    // Loading animation
    const id = this.route.snapshot.paramMap.get('id');

    const stateProspect = history.state?.prospect;
    if (stateProspect) {
      this.prospect = stateProspect;
      this.loading = false;
    }

    if (!id) {
      if (!stateProspect) {
        this.error = 'Prospectlijst niet gevonden.';
        this.loading = false;
      }
      return;
    }

    this.service.getProspectById(id).subscribe({
      next: (res: any) => {
        this.prospect = res.data ?? res;
        this.loading = false;
        this.loadConnectedProfiles();
        this.cdr.detectChanges();
      },
      error: () => {
        if (!stateProspect) {
          this.error = 'Prospectlijst niet gevonden.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Load business profiles (left side)
  private loadConnectedProfiles() {
    const ids: number[] = this.prospect?.company_ids ?? [];
    const scores: number[] = this.prospect?.accuracy_scores ?? [];
    if (!ids.length) return;

    const requests = ids.map(id => this.companiesService.getBusinessProfileById(id));
    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        this.connectedProfiles = results.map((r, i) => ({
          ...(r.data ?? r),
          accuracy: scores[i] ?? null,
        }));
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // Sort
  get sortedProfiles(): any[] {
    const list = [...this.connectedProfiles];
    switch (this.sortOrder) {
      case 'accuracy-desc':
        return list.sort((a, b) => (b.accuracy ?? b.score ?? 0) - (a.accuracy ?? a.score ?? 0));
      case 'accuracy-asc':
        return list.sort((a, b) => (a.accuracy ?? a.score ?? 0) - (b.accuracy ?? b.score ?? 0));
      case 'name-asc':
        return list.sort((a, b) => (a.naam ?? '').localeCompare(b.naam ?? ''));
      case 'name-desc':
        return list.sort((a, b) => (b.naam ?? '').localeCompare(a.naam ?? ''));
      default:
        return list;
    }
  }

  goBack() {
    this.router.navigate(['/prospects']);
  }

  get listName(): string {
    return this.prospect?.naam ?? this.prospect?.productname ?? this.prospect?.partnerName ?? '?';
  }

  get sector(): string {
    return this.prospect?.jobdomein ?? this.prospect?.sector ?? '';
  }

  get tagsList(): string[] {
    const raw = this.prospect?.tags_technology ?? this.prospect?.technologies ?? '';
    return raw ? raw.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
  }

  get isJobMode(): boolean {
    return !!(this.prospect?.partnerName ?? this.prospect?.partnername);
  }

  get createdAt(): string {
    const raw = this.prospect?.created_at;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  accuracyOf(p: any): number | null {
    const v = p.accuracy ?? p.score ?? p.match_score ?? null;
    return v !== null ? Math.round(v) : null;
  }

  accuracyColor(score: number | null): string {
    if (score === null) return 'var(--muted)';
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }
}
