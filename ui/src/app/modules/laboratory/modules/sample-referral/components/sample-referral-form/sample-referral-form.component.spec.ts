import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleReferralFormComponent } from './sample-referral-form.component';

describe('SampleReferralFormComponent', () => {
  let component: SampleReferralFormComponent;
  let fixture: ComponentFixture<SampleReferralFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleReferralFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SampleReferralFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
