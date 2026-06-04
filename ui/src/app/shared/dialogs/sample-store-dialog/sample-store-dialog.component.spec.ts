import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleStoreDialogComponent } from './sample-store-dialog.component';

describe('SampleStoreDialogComponent', () => {
  let component: SampleStoreDialogComponent;
  let fixture: ComponentFixture<SampleStoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleStoreDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SampleStoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
