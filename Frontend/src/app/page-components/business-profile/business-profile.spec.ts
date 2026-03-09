import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessProfile } from './business-profile';

describe('BusinessProfile', () => {
  let component: BusinessProfile;
  let fixture: ComponentFixture<BusinessProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
