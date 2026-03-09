import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-header',
  imports: [],
  templateUrl: './filter-header.html',
  styleUrl: './filter-header.css',
})
export class FilterHeader {
    @Input() filters: string[] = [];
    @Input() activeFilter: string = '';
    @Input() addLabel: string = '+ Add';
    @Output() activeFilterChange = new EventEmitter<string>();
}
