import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-encounters-list",
  templateUrl: "./encounters-list.component.html",
  styleUrls: ["./encounters-list.component.scss"],
})
export class EncountersListComponent implements OnInit {
  @Input() visitDetails: any;
  constructor() {}

  ngOnInit(): void {
    console.log(this.visitDetails);
  }
}
