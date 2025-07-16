/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CurrentPatientBillingComponent } from './current-patient-billing.component';
import { beforeEach } from 'mocha';
import { describe } from 'mocha';
import { expect } from 'chai';
import { it } from 'mocha';

describe('CurrentPatientBillingComponent', () => {
  let component: CurrentPatientBillingComponent;
  let fixture: ComponentFixture<CurrentPatientBillingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentPatientBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentPatientBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
