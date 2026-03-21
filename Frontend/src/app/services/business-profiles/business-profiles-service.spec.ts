import { TestBed } from '@angular/core/testing';
import { BusinessProfilesServices } from './business-profiles-service';

describe('BusinessProfiles', () => {
  let service: BusinessProfilesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessProfilesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
