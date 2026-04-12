import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessProfileDetailPage } from './business-profile-detail-page';

describe('BusinessProfileDetailPage', () => {
  let component: BusinessProfileDetailPage;
  let fixture: ComponentFixture<BusinessProfileDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessProfileDetailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessProfileDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
