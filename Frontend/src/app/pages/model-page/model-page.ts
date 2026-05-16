import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { PageHeader } from '../../page-components/page-header/page-header';
import { FormsModule } from '@angular/forms';
import { ModelsService } from '../../services/models/models-service';
import { BusinessProfilesServices } from '../../services/business-profiles/business-profiles-service';
import { CommonModule } from '@angular/common';
import { Model } from '../../models/model';

@Component({
  selector: 'app-model-page',
  imports: [PageHeader, FormsModule, CommonModule],
  templateUrl: './model-page.html',
  styleUrl: './model-page.css',
})

export class ModelPage implements OnInit {
  showScreen = false;
  trainingStarted = false;
  versions: Model[] = [];
  activeModel: Model | null = null;
  totalBusinessProfiles: number = 0;
  loading = true;

  private businessService = inject(BusinessProfilesServices);
  cdr = inject(ChangeDetectorRef);

  constructor(private modelsService: ModelsService) {}

    ngOnInit(): void {
      this.loadProfiles();
      this.loadModels();
    }

    loadModels(): void {
      this.modelsService.getAllModels().subscribe({
        next: (response) => {
          this.versions = response.data;
          this.activeModel = this.versions.find(v => v.is_active) || null;
          this.cdr.detectChanges();
          this.checkDone();
        },
          error: (err) => {
          console.error('Models laden mislukt', err);
          this.checkDone();
        }
      });
    }

    activate(model: Model): void {
      this.modelsService.activateModel(model.id.toString()).subscribe(() => {
      this.loadModels();
      });
    }

    startTraining(): void {
    this.modelsService.trainModel().subscribe({
      next: (response) => {
        this.showScreen = false;
        this.trainingStarted = true;
        console.log('Training gestart:', response.message);
        this.loadModels();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Er is iets misgegaan bij het starten van de training:', err);
        this.showScreen = false;
      }
    });
  }

    loadProfiles(){
      this.businessService.getAllBusinessProfiles().subscribe({
      next: (res: any) => {
        this.totalBusinessProfiles = res?.count ?? 0;
        this.checkDone();
      },
      error: (err) => {
        console.error('Profielen laden mislukt', err);
        this.checkDone();
      }
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