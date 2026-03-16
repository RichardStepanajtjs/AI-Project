import { TestBed } from '@angular/core/testing';

import { ProspectslistService } from '../prospectslist/prospectslist-service';

describe('ProspectslistService', () => {
  let service: ProspectslistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProspectslistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
