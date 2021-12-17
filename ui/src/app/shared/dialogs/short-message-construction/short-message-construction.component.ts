import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Component({
  selector: "app-short-message-construction",
  templateUrl: "./short-message-construction.component.html",
  styleUrls: ["./short-message-construction.component.scss"],
})
export class ShortMessageConstructionComponent implements OnInit {
  durationUnitsConceptUuid$: Observable<any>;
  constructor(
    private dialogRef: MatDialogRef<ShortMessageConstructionComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.durationUnitsConceptUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "order.durationUnitsConceptUuid"
      );
  }
}
