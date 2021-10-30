import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsApprovalDashboardComponent } from './results-approval-dashboard.component';

describe('ResultsApprovalDashboardComponent', () => {
  let component: ResultsApprovalDashboardComponent;
  let fixture: ComponentFixture<ResultsApprovalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsApprovalDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsApprovalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
