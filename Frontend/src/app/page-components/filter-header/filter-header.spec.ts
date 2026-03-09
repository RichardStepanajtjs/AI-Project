import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterHeader } from './filter-header';

describe('FilterHeader', () => {
  let component: FilterHeader;
  let fixture: ComponentFixture<FilterHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
