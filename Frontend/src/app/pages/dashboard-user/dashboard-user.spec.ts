import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUser } from './dashboard-user';

describe('DashboardUser', () => {
  let component: DashboardUser;
  let fixture: ComponentFixture<DashboardUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
