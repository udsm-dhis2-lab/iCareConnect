import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSlotsDialogComponent } from './generate-slots-dialog.component';

describe('GenerateSlotsDialogComponent', () => {
  let component: GenerateSlotsDialogComponent;
  let fixture: ComponentFixture<GenerateSlotsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateSlotsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerateSlotsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
