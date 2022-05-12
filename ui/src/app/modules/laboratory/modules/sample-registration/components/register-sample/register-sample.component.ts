import { Component, OnInit } from "@angular/core";
import { MatRadioChange } from "@angular/material/radio";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
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
  mrnGeneratorSourceUuid$: Observable<string>;
  preferredPersonIdentifier$: Observable<string>;
  constructor(
    private samplesService: SamplesService,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.labSamples$ = this.samplesService.getCollectedSamples();
    this.mrnGeneratorSourceUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.generateMRN.source"
      );
    this.preferredPersonIdentifier$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.preferredPersonIdentifier"
      );
  }

  getSelection(event: MatRadioChange): void {
    this.registrationCategory = event?.value;
  }
}
