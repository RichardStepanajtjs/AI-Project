import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectsForm } from './prospects-form';

describe('ProspectsForm', () => {
  let component: ProspectsForm;
  let fixture: ComponentFixture<ProspectsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
