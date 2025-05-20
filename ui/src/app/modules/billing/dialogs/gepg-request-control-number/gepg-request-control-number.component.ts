import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-gepg-request-control-number",
  templateUrl: "./gepg-request-control-number.component.html",
  styleUrls: ["./gepg-request-control-number.component.scss"],
})
export class GePGRequestControlNumber implements OnInit {
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  async ngOnInit() {
    
  }
}
