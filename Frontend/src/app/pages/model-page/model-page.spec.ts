import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelPage } from './model-page';

describe('ModelPage', () => {
  let component: ModelPage;
  let fixture: ComponentFixture<ModelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
