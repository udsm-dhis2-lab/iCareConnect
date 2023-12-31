import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-occupied-location-status-modal",
  templateUrl: "./occupied-location-status-modal.component.html",
  styleUrls: ["./occupied-location-status-modal.component.scss"],
})
export class OccupiedLocationStatusModalComponent implements OnInit {
  details: any;
  patientPrefferedIdentifier: string;
  constructor(
    private dialogRef: MatDialogRef<OccupiedLocationStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.details = data?.details;
    this.patientPrefferedIdentifier = this.details?.visit
      ? (this.details?.visit?.patient?.identifiers?.filter(
          (identifier: any) => identifier?.preferred
        ) || [])[0]?.identifier
      : "";
  }

  ngOnInit(): void {}
}
