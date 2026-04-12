import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectDetailPage } from './prospect-detail-page';

describe('ProspectDetailPage', () => {
  let component: ProspectDetailPage;
  let fixture: ComponentFixture<ProspectDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectDetailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
