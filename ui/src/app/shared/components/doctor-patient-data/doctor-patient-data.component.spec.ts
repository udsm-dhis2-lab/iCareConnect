import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPatientDataComponent } from './doctor-patient-data.component';

describe('DoctorPatientDataComponent', () => {
  let component: DoctorPatientDataComponent;
  let fixture: ComponentFixture<DoctorPatientDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorPatientDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorPatientDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
