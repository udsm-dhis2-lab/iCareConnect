import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralSampleInformationComponent } from './referral-sample-information.component';

describe('ReferralSampleInformationComponent', () => {
  let component: ReferralSampleInformationComponent;
  let fixture: ComponentFixture<ReferralSampleInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralSampleInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReferralSampleInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
