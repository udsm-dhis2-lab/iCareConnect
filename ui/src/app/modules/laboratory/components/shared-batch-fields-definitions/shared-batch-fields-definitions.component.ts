import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Component({
  selector: "app-shared-batch-fields-definitions",
  templateUrl: "./shared-batch-fields-definitions.component.html",
  styleUrls: ["./shared-batch-fields-definitions.component.scss"],
})
export class SharedBatchFieldsDefinitionsComponent implements OnInit {
  @Input() registrationCategory: any;
  formUuids$: Observable<any>;
  errors: any[] = [];

  @Output() selectedFieldsByCategory: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() selectedFieldsData: EventEmitter<any> = new EventEmitter<any>();
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.formUuids$ = this.systemSettingsService.getSystemSettingsByKey(
      `icare.lis.sampleRegistrationFormsUuids.${this.registrationCategory?.refKey}`
    );
    this.formUuids$.subscribe((response: any) => {
      if (response && (response?.error || response === "none")) {
        this.errors = [
          ...this.errors,
          {
            error: {
              error:
                "Forms references for " +
                this.registrationCategory?.refKey +
                " are missing",
              message:
                "Forms references for " +
                this.registrationCategory?.refKey +
                " are missing",
            },
          },
        ];
      }
    });
  }

  onGetSelectedFields(fields: any): void {
    this.selectedFieldsByCategory.emit(fields);
  }

  onGetFormFieldsData(formData: any): void {
    this.selectedFieldsData.emit(formData);
  }
}
