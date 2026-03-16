import { Component, inject } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-prospects-form',
  imports: [PageHeader, FormsModule, ReactiveFormsModule],
  templateUrl: './prospects-form.html',
  styleUrl: './prospects-form.css',
})
export class ProspectsForm {
  private fb = inject(FormBuilder)

  isJobMode = false;

  form = this.fb.group({
    productName: ['', Validators.required],
    sector: ['', Validators.required],
    shortDescription: [''],
    targetGroup: ['', Validators.required],
    tagsTechnologies: ['', Validators.required],
    amountOfProspects: ['10', [Validators.required, Validators.min(1), Validators.max(25)]],
  });

  toggle(): void {
    this.isJobMode = !this.isJobMode;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    console.log(this.form.value)
  }
}
