import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessProfilesPage } from './business-profiles-page';

describe('BusinessProfilesPage', () => {
  let component: BusinessProfilesPage;
  let fixture: ComponentFixture<BusinessProfilesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessProfilesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessProfilesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
