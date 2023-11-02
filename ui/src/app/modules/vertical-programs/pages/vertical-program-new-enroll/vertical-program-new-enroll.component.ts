import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-vertical-program-new-enroll",
  templateUrl: "./vertical-program-new-enroll.component.html",
  styleUrls: ["./vertical-program-new-enroll.component.scss"],
})
export class VerticalProgramNewEnrollComponent implements OnInit {
  @Input() program;
  @Input() selectedService;
  constructor() {}

  ngOnInit(): void {
    console.log("VerticalProgram", this.program);
  }
}
