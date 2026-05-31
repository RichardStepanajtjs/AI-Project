import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProspectslistService } from '../../services/prospectslist/prospectslist-service';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { FormsService } from '../../services/forms/forms-service';
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
  private formsService = inject(FormsService);
  private cdr = inject(ChangeDetectorRef);

  prospect: any = null;
  form: any = null;
  connectedProfiles: any[] = [];
  loading = true;
  error = '';
  sortOrder = 'accuracy-desc';
  draggedIndex: number | null = null;

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

    this.service.getProspectListById(id).subscribe({
      next: (res: any) => {
        this.prospect = res.data ?? res;
        this.loading = false;
        this.loadConnectedProfiles();
        if (this.prospect?.form_id) {
          this.loadForm(this.prospect.form_id);
        }
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

  private loadForm(formId: number) {
    this.formsService.getFormById(formId).subscribe({
      next: (res: any) => {
        this.form = res.data ?? res;
        this.cdr.detectChanges();
      },
      error: () => {}
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

  deleteList() {
    if (confirm('Wilt u deze lijst definitief verwijderen?')) {
      this.service.deleteProspectList(this.prospect.id).subscribe({
        next: () => this.router.navigate(['/prospect-lists']),
        error: (err) => console.error('Delete failed', err)
      });
    }
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
      case 'manual':
      default:
        return list; 
    }
  }
  
  onDragStart(index: number) {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent) {
    // Dit is verplicht in HTML5, anders laat de browser de 'drop' niet toe
    event.preventDefault(); 
  }

  onDrop(dropIndex: number, event: DragEvent) {
    event.preventDefault();
    
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      return;
    }

    // Pak de huidige visuele volgorde
    const currentList = [...this.sortedProfiles];
    
    // Verwijder het versleepte item en voeg het in op de nieuwe plek
    const itemToMove = currentList.splice(this.draggedIndex, 1)[0];
    currentList.splice(dropIndex, 0, itemToMove);
    
    // Sla op en zet dropdown op 'manual'
    this.connectedProfiles = currentList;
    this.sortOrder = 'manual';

    // Update het prospect object voor je backend save
    this.prospect.company_ids = this.connectedProfiles.map(p => p.id); 
    this.prospect.accuracy_scores = this.connectedProfiles.map(p => p.accuracy);
    
    // Reset en trigger update
    this.draggedIndex = null;
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate(['/prospect-lists']);
  }

  get listName(): string {
    return this.prospect?.naam ?? '?';
  }

  get sector(): string {
    return this.form?.sector ?? this.prospect?.jobdomein ?? '';
  }

  get tagsList(): string[] {
    const raw = this.form?.technologies;
    if (!raw) return [];
    // PostgreSQL array komt als JS array binnen, anders komma-string als fallback
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return String(raw).split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  get isJobMode(): boolean {
    return !!(this.form?.is_job);
  }

  get partnerName(): string {
    return this.form?.partner_name ?? '–';
  }

  get description(): string {
    return this.form?.generated_description ?? this.form?.description ?? '';
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