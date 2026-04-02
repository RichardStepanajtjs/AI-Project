import { Component, inject } from '@angular/core';
import { Prospect } from '../../page-components/prospect/prospect';
import { PageHeader } from "../../page-components/page-header/page-header";
import { FilterHeader } from '../../page-components/filter-header/filter-header';
import { ProspectslistService } from '../../services/prospectslist/prospectslist-service';

@Component({
  selector: 'app-prospects-page',
  imports: [Prospect, PageHeader, FilterHeader],
  templateUrl: './prospects-page.html',
  styleUrl: './prospects-page.css',
})
export class ProspectsPage {
  private prospectsService = inject(ProspectslistService);

  alleLijsten: any[] = [];
  
  sectorFilters: string[] = [
  "Alle sectoren",
  "Aankoop",
  "Administratie",
  "Bouw",
  "Communicatie",
  "Creatief",
  "Dienstverlening",
  "Financieel",
  "Gezondheid",
  "Horeca en toerisme",
  "Human resources",
  "ICT",
  "Juridisch",
  "Land- en tuinbouw",
  "Logistiek en transport",
  "Management",
  "Marketing",
  "Onderhoud",
  "Onderwijs",
  "Onderzoek en ontwikkeling",
  "Overheid",
  "Productie",
  "Techniek",
  "Verkoop",
  "Andere"
];
  geselecteerdeSector = 'Alle sectoren';

ngOnInit() {
    this.prospectsService.getProspects().subscribe({
      next: (data: any) => {
        this.alleLijsten = data;
      },
      error: (err) => console.error(err)
    });
  }

  get gefilterdeLijsten() {
    return this.geselecteerdeSector === 'Alle sectoren' 
      ? this.alleLijsten 
      : this.alleLijsten.filter(l => l.jobdomein === this.geselecteerdeSector);
  }
}
