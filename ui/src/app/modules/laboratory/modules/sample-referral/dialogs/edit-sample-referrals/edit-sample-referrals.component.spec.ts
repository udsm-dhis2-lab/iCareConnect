import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSampleReferralsComponent } from './edit-sample-referrals.

describe('EditSampleReferralsComponent', () => {
  let component: EditSampleReferralsComponent;
  let fixture: ComponentFixture<EditSampleReferralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSampleReferralsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSampleReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
