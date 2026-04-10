import { Component } from '@angular/core';
import { PageHeader } from '../../page-components/page-header/page-header';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-model-page',
  imports: [PageHeader, FormsModule],
  templateUrl: './model-page.html',
  styleUrl: './model-page.css',
})
export class ModelPage {
  showScreen = false;
  trainingStarted = false;

  // TODO: te connecteren met de backend
  versions = [
    { version: 'v2.4.1', date: '1 mrt 2026', score: 84, f1: 0.79, active: true  },
    { version: 'v2.4.0', date: '15 feb 2026', score: 81, f1: 0.75, active: false },
    { version: 'v2.3.0', date: '3 jan 2026', score: 79, f1: 0.73, active: false },
    { version: 'v2.2.0', date: '10 nov 2025', score: 76, f1: 0.70, active: false },
  ];

  activate(selected: any) {
    this.versions.forEach(v => v.active = false);
    selected.active = true;
  }

  startTraining() {
    this.trainingStarted = true;
    this.showScreen = false;
    console.log('Hertraining gestart');
  }
}
