import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerPrintComponent } from './finger-print.component';

describe('FingerPrintComponent', () => {
  let component: FingerPrintComponent;
  let fixture: ComponentFixture<FingerPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FingerPrintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FingerPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
