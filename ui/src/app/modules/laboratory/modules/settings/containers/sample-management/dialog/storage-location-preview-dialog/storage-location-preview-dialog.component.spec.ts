import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLocationPreviewDialogComponent } from './storage-location-preview-dialog.component';

describe('StorageLocationPreviewDialogComponent', () => {
  let component: StorageLocationPreviewDialogComponent;
  let fixture: ComponentFixture<StorageLocationPreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageLocationPreviewDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageLocationPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
