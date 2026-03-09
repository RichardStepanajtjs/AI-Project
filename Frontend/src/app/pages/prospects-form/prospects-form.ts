import { Component } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-prospects-form',
  imports: [PageHeader, FormsModule, ReactiveFormsModule],
  templateUrl: './prospects-form.html',
  styleUrl: './prospects-form.css',
})
export class ProspectsForm {
  isJobMode = false;

  toggle(): void {
      this.isJobMode = !this.isJobMode;
  }

  reset(): void {
      this.isJobMode = false;
  }
}
