import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageDialogComponent } from './storage-dialog.component';

describe('StorageDialogComponent', () => {
  let component: StorageDialogComponent;
  let fixture: ComponentFixture<StorageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
