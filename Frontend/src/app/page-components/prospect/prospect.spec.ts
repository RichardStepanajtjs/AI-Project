import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prospect } from './prospect';

describe('Prospect', () => {
  let component: Prospect;
  let fixture: ComponentFixture<Prospect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prospect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Prospect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
