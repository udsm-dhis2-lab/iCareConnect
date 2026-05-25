import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSampleReferralsComponent } from './add-sample-referrals.component';

describe('AddSampleReferralsComponent', () => {
  let component: AddSampleReferralsComponent;
  let fixture: ComponentFixture<AddSampleReferralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSampleReferralsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSampleReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
