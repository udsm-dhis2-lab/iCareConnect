import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-single-registration",
  templateUrl: "./single-registration.component.html",
  styleUrls: ["./single-registration.component.scss"],
})
export class SingleRegistrationComponent implements OnInit {
  labSamples$: Observable<LabSampleModel[]>;
  labSampleLabel$: Observable<string>;
  constructor(private samplesService: SamplesService) {}

  ngOnInit(): void {
    this.labSamples$ = this.samplesService.getCollectedSamples();
    this.labSampleLabel$ = this.samplesService.getSampleLabel();
  }
}
