import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-import-details",
  templateUrl: "./import-details.component.html",
  styleUrls: ["./import-details.component.scss"],
})
export class ImportDetailsComponent implements OnInit {
  response: any;
  currentReport: any;
  constructor(
    private matDialogRef: MatDialogRef<ImportDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.response = data?.response;
    this.currentReport = data?.report;
  }

  ngOnInit(): void {}
}
