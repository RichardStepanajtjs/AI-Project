import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-header',
  imports: [FormsModule],
  templateUrl: './filter-header.html',
  styleUrl: './filter-header.css',
})
export class FilterHeader {
    // dropdown voor domeinen
    @Input() filters: string[] = [];
    @Input() activeFilter: string = '';
    @Output() activeFilterChange = new EventEmitter<string>();

    @Input() addLabel: string = '+ Add';
    @Input() searchTerm: string = '';
    @Input() searchPlaceholder: string = 'Zoeken...';
    @Input() showSearch: boolean = true;
    @Input() showAddTag: boolean = false;
    @Output() searchTermChange = new EventEmitter<string>();
    @Output() addTag = new EventEmitter<string>();
    
    dropdownOpen = false;
    tagValue = '';

    constructor(private el: ElementRef) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.el.nativeElement.contains(event.target)) {
            this.dropdownOpen = false;
        }
    }

    onAddTag() {
        const trimmed = this.tagValue.trim();
        if (trimmed) {
            this.addTag.emit(trimmed);
            this.tagValue = '';
        }
    }
}