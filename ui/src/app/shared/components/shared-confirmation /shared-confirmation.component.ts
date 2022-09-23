import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: "app-shared-confirmation",
  templateUrl: "./shared-confirmation.component.html",
  styleUrls: ["./shared-confirmation.component.scss"],
})
export class SharedConfirmationComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<SharedConfirmationComponent>
  ) {}

  ngOnInit() {}

  onCancel(e): void {
    e.stopPropagation();
    this.matDialogRef.close();
  }

  onConfirm(e): void {
    e.stopPropagation();
    this.matDialogRef.close({ confirmed: true });
  }
}
