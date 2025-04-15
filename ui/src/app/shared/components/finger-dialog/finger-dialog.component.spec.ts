import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerDialogComponent } from './finger-dialog.component';

describe('FingerDialogComponent', () => {
  let component: FingerDialogComponent;
  let fixture: ComponentFixture<FingerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FingerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FingerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
