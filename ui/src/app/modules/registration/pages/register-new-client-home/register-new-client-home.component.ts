import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { RegistrationService } from "../../services/registration.services";

@Component({
  selector: "app-register-new-client-home",
  templateUrl: "./register-new-client-home.component.html",
  styleUrls: ["./register-new-client-home.component.scss"],
})
export class RegisterNewClientHomeComponent implements OnInit {
  registrationMRNSourceReference$: Observable<any>;
  registrationFormConfigs$: Observable<any>;
  constructor(
    private registrationService: RegistrationService,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.registrationFormConfigs$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        "icare.registration.form"
      );
    this.registrationMRNSourceReference$ =
      this.registrationService.getRegistrationMRNSource();
  }
}
