import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabTestsManagementComponent } from './lab-tests-management.component';

describe('LabTestsManagementComponent', () => {
  let component: LabTestsManagementComponent;
  let fixture: ComponentFixture<LabTestsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTestsManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTestsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
