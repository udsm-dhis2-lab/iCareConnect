import { Component, OnInit } from "@angular/core";
import { MatRadioChange } from "@angular/material/radio";

@Component({
  selector: "app-register-sample",
  templateUrl: "./register-sample.component.html",
  styleUrls: ["./register-sample.component.scss"],
})
export class RegisterSampleComponent implements OnInit {
  registrationCategory: string = "single";
  constructor() {}

  ngOnInit(): void {}

  getSelection(event: MatRadioChange): void {
    this.registrationCategory = event?.value;
  }
}
