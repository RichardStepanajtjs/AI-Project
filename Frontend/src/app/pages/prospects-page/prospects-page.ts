import { Component } from '@angular/core';
import { Prospect } from '../../page-components/prospect/prospect';
import { PageHeader } from "../../page-components/page-header/page-header";
import { FilterHeader } from '../../page-components/filter-header/filter-header';

@Component({
  selector: 'app-prospects-page',
  imports: [Prospect, PageHeader, FilterHeader],
  templateUrl: './prospects-page.html',
  styleUrl: './prospects-page.css',
})
export class ProspectsPage {
  sectorFilters = ['Alle sectoren', 'test', 'test2', 'test3'];
  geselecteerdeSector = 'Alle sectoren';
}
