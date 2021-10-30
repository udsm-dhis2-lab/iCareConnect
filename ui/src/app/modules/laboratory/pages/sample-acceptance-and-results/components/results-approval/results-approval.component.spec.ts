import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsApprovalComponent } from './results-approval.component';

describe('ResultsApprovalComponent', () => {
  let component: ResultsApprovalComponent;
  let fixture: ComponentFixture<ResultsApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
