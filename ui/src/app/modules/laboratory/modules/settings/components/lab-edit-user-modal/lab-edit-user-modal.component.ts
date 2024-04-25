import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Component({
  selector: "app-lab-edit-user-modal",
  templateUrl: "./lab-edit-user-modal.component.html",
  styleUrls: ["./lab-edit-user-modal.component.scss"],
})
export class LabEditUserModalComponent implements OnInit {
  securitySystemSettings$: Observable<any>;
  constructor(
    private dialogRef: MatDialogRef<LabEditUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.securitySystemSettings$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey("security.");
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onCancel(shouldClose: boolean): void {
    if (shouldClose) {
      this.dialogRef.close();
    }
  }
}
