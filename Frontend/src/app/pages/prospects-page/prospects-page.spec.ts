import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectsPage } from './prospects-page';

describe('ProspectsPage', () => {
  let component: ProspectsPage;
  let fixture: ComponentFixture<ProspectsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
