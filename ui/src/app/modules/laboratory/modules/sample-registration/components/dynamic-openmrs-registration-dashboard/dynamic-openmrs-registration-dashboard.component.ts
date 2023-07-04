import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-dynamic-openmrs-registration-dashboard",
  templateUrl: "./dynamic-openmrs-registration-dashboard.component.html",
  styleUrls: ["./dynamic-openmrs-registration-dashboard.component.scss"],
})
export class DynamicOpenmrsRegistrationDashboardComponent implements OnInit {
  @Input() registrationCategory: string;
  formUuids$: Observable<string[]>;
  errors: any[] = [];
  @Output() formDataUpdate: EventEmitter<any> = new EventEmitter<any>();
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.formUuids$ = this.systemSettingsService.getSystemSettingsByKey(
      `icare.lis.sampleRegistrationFormsUuids.${this.registrationCategory?.toLowerCase()}`
    );
    this.formUuids$.subscribe((response: any) => {
      if (response && (response?.error || response === "none")) {
        this.errors = [
          ...this.errors,
          {
            error: {
              error:
                "Forms references for " +
                this.registrationCategory +
                " are missing",
              message:
                "Forms references for " +
                this.registrationCategory +
                " are missing",
            },
          },
        ];
      }
    });
  }

  onFormUpdate(data: FormValue): void {
    this.formDataUpdate.emit(data);
  }
}
