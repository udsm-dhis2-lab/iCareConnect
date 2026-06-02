import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLocationTypeDialogComponent } from './storage-location-type-dialog.component';

describe('StorageLocationTypeDialogComponent', () => {
  let component: StorageLocationTypeDialogComponent;
  let fixture: ComponentFixture<StorageLocationTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageLocationTypeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageLocationTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
