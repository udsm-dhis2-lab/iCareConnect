import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleDisposeDialogComponent } from './sample-dispose-dialog.component';

describe('SampleDisposeDialogComponent', () => {
  let component: SampleDisposeDialogComponent;
  let fixture: ComponentFixture<SampleDisposeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleDisposeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SampleDisposeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
