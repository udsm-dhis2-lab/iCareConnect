import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageTypeDialogComponent } from './storage-type-dialog.component';

describe('StorageTypeDialogComponent', () => {
  let component: StorageTypeDialogComponent;
  let fixture: ComponentFixture<StorageTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageTypeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
