import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { FormsService, FormPayload } from './forms-service';

describe('FormsService', () => {
  let service: FormsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FormsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST the form payload to /forms', () => {
    const payload: FormPayload = {
      partner_name: 'Test Partner',
      sector: 'ICT',
      description: 'Test beschrijving',
      technologies: ['Angular', 'Node.js'],
    };

    service.createForm(payload).subscribe();

    const req = httpMock.expectOne('https://nest.sokrates.traefik.me/forms');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: { id: 1, ...payload } });
  });
});
