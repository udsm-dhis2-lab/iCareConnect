import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-add-new-generic-drug-modal",
  templateUrl: "./add-new-generic-drug-modal.component.html",
  styleUrls: ["./add-new-generic-drug-modal.component.scss"],
})
export class AddNewGenericDrugModalComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<AddNewGenericDrugModalComponent>
  ) {}

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    event.stopPropagation();
  }
}
