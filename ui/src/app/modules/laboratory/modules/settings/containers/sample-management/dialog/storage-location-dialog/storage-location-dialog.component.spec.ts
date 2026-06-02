import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLocationDialogComponent } from './storage-location-dialog.component';

describe('StorageLocationDialogComponent', () => {
  let component: StorageLocationDialogComponent;
  let fixture: ComponentFixture<StorageLocationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageLocationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
