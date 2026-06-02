import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable, from, isObservable, of } from "rxjs";
import { finalize } from "rxjs/operators";

export interface SampleManagementDeleteConfirmDialogData {
  entityLabel: string;
  name: string;
  description: string;
  impactMessage: string;
  confirmLabel?: string;
  confirmAction?: () => Observable<any> | Promise<any> | any;
}

@Component({
  selector: "app-sample-management-delete-confirm-dialog",
  templateUrl: "./delete-confirm-dialog.component.html",
  styleUrls: ["./delete-confirm-dialog.component.scss"],
})
export class DeleteConfirmDialogComponent {
  deleting = false;
  errorMessage = "";

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: SampleManagementDeleteConfirmDialogData,
    private readonly dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
  ) {}

  get confirmLabel(): string {
    return (
      this.data?.confirmLabel || `Delete ${this.data?.entityLabel || "record"}`
    );
  }

  close(): void {
    if (this.deleting) {
      return;
    }
    this.dialogRef.close({ confirmed: false });
  }

  confirm(): void {
    if (this.deleting) {
      return;
    }

    if (!this.data?.confirmAction) {
      this.dialogRef.close({ confirmed: true });
      return;
    }

    this.deleting = true;
    this.errorMessage = "";

    const actionResult = this.data.confirmAction();
    const action$ = isObservable(actionResult)
      ? actionResult
      : actionResult && typeof (actionResult as any).then === "function"
      ? from(actionResult as Promise<any>)
      : of(actionResult);

    action$.pipe(finalize(() => (this.deleting = false))).subscribe({
      next: (response) => {
        this.dialogRef.close({ confirmed: true, deleted: true, response });
      },
      error: (error: any) => {
        this.errorMessage = this.getErrorMessage(
          error,
          "Unable to delete the selected record.",
        );
      },
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}
