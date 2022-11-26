import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRoomComponent } from './select-room.component';
import { materialModules } from 'src/app/shared/material-modules';
import {
  MatLegacyDialogRef as MatDialogRef,
  MatLegacyDialogModule as MatDialogModule,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SelectRoomComponent', () => {
  let component: SelectRoomComponent;
  let fixture: ComponentFixture<SelectRoomComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [...materialModules, MatDialogModule, BrowserAnimationsModule],
      declarations: [SelectRoomComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: ['Room 1', 'Room 2']
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
