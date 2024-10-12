import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-shared-remote-patient-history-modal",
  templateUrl: "./shared-remote-patient-history-modal.component.html",
  styleUrl: "./shared-remote-patient-history-modal.component.scss",
})
export class SharedRemotePatientHistoryModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
