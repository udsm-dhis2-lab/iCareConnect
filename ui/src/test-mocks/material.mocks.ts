import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { of } from 'rxjs';

/**
 * Mat Dialog mock
 */
export class MatDialogMock {
  open() {
    return {
      afterClosed: () => of({ action: true }),
    };
  }
}

export const matDialogProviderMock = {
  provide: MatDialog,
  useClass: MatDialogMock,
};

/**
 * MatSnackBar mock
 */

export class MatSnackBarMock {
  open(message, action, options) {}
}
export const matSnackBarProviderMock = {
  provide: MatSnackBar,
  useClass: MatSnackBarMock,
};

/**
 * MatDialogRef mock
 */
const mockDialogRef = {
  close: jasmine.createSpy('close'),
};

export const matDialogRefMock = {
  provide: MatDialogRef,
  useValue: mockDialogRef,
};

/**
 * MAT_DIALOG_DATA mock
 */
export const matDialogDataMock = {
  provide: MAT_DIALOG_DATA,
  useValue: null,
};
