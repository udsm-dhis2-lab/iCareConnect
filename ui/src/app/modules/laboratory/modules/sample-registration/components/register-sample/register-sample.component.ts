import { Component, OnInit } from "@angular/core";
import { MatRadioChange } from "@angular/material/radio";
import { Observable } from "rxjs";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-register-sample",
  templateUrl: "./register-sample.component.html",
  styleUrls: ["./register-sample.component.scss"],
})
export class RegisterSampleComponent implements OnInit {
  registrationCategory: string = "single";

  labSamples$: Observable<LabSampleModel[]>;
  constructor(private samplesService: SamplesService) {}

  ngOnInit(): void {
    this.labSamples$ = this.samplesService.getCollectedSamples();
  }

  getSelection(event: MatRadioChange): void {
    this.registrationCategory = event?.value;
  }
}
