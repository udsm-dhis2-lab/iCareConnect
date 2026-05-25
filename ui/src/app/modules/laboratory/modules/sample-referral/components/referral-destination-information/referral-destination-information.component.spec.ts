import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralDestinationInformationComponent } from './referral-destination-information.component';

describe('ReferralDestinationInformationComponent', () => {
  let component: ReferralDestinationInformationComponent;
  let fixture: ComponentFixture<ReferralDestinationInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralDestinationInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReferralDestinationInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
