import { Component, OnInit } from "@angular/core";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-worksheet-management",
  templateUrl: "./worksheet-management.component.html",
  styleUrls: ["./worksheet-management.component.scss"],
})
export class WorksheetManagementComponent implements OnInit {
  isFormValid: boolean = false;
  worksheetPayload: any = {};
  errors: any[] = [];
  saving: boolean = false;
  constructor(private worksheetsService: WorkSeetsService) {}

  ngOnInit(): void {}

  onSave(event: Event): void {
    event.stopPropagation();
    this.saving = true;
    this.worksheetsService
      .createWorkSheet([this.worksheetPayload])
      .subscribe((response) => {
        if (response && !response?.error) {
          this.saving = false;
        } else {
          this.errors = [...this.errors, response];
        }
      });
  }

  onGetFormValues(formValue: FormValue): void {
    const values = formValue.getValues();
    this.isFormValid = formValue.isValid;
    this.worksheetPayload = {
      name: values?.name?.value,
      code: values?.code?.value,
      description: values?.description?.value,
      rows: Number(values?.rows?.value),
      columns: Number(values?.columns?.value),
      testorder: values?.testorder?.value
        ? {
            uuid: values?.testorder?.value,
          }
        : null,
      instrument: values?.instrument?.value
        ? {
            uuid: values?.instrument?.value,
          }
        : null,
    };
  }
}
