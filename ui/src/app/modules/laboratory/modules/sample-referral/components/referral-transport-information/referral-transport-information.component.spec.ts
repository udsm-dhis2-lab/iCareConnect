import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralTransportInformationComponent } from './referral-transport-information.component';

describe('ReferralTransportInformationComponent', () => {
  let component: ReferralTransportInformationComponent;
  let fixture: ComponentFixture<ReferralTransportInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralTransportInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReferralTransportInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
