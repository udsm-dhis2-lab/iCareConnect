import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralPackagingInformationComponent } from './referral-packaging-information.component';

describe('ReferralPackagingInformationComponent', () => {
  let component: ReferralPackagingInformationComponent;
  let fixture: ComponentFixture<ReferralPackagingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralPackagingInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReferralPackagingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
