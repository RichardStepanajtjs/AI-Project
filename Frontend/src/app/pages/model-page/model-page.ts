import { Component, OnInit } from '@angular/core';
import { PageHeader } from '../../page-components/page-header/page-header';
import { FormsModule } from '@angular/forms';
import { ModelsService } from '../../services/models/models-service';
import { CommonModule } from '@angular/common';
import { Model } from '../../models/model';

@Component({
  selector: 'app-model-page',
  imports: [PageHeader, FormsModule],
  templateUrl: './model-page.html',
  styleUrl: './model-page.css',
})

export class ModelPage implements OnInit {
  showScreen = false;
  trainingStarted = false;
  versions: Model[] = [];

  constructor(private modelsService: ModelsService) {}

    ngOnInit(): void {
      this.loadModels();
    }

    loadModels(): void {
      this.modelsService.getAllModels().subscribe({
        next: (response) => {
          this.versions = response.data;
        },
          error: (err) => console.error('Data ophalen mislukt', err)
      });
    }

    activate(model: Model): void {
      this.modelsService.activateModel(model.id.toString()).subscribe(() => {
      this.loadModels();
      });
    }

    startTraining(): void {
      this.modelsService.createModel('Handmatige hertraining').subscribe(() => {
        this.showScreen = false;
        this.trainingStarted = true;
        this.loadModels();
      });
    }
  }