import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerCaptureComponent } from './finger-capture.component';

describe('FingerCaptureComponent', () => {
  let component: FingerCaptureComponent;
  let fixture: ComponentFixture<FingerCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FingerCaptureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FingerCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
