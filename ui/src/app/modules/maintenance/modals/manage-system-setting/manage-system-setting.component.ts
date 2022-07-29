import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-manage-system-setting",
  templateUrl: "./manage-system-setting.component.html",
  styleUrls: ["./manage-system-setting.component.scss"],
})
export class ManageSystemSettingComponent implements OnInit {
  dialogData: any;
  formFields: any[];
  isFormValid: boolean;

  data: any;
  savingData: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<ManageSystemSettingComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private systemSettingsService: SystemSettingsService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.data = {
      value: "",
      description: "",
      uuid: this.dialogData?.uuid,
    };
    this.formFields = [
      new Textbox({
        id: "value",
        key: "value",
        required: true,
        value: this.dialogData?.value ? this.dialogData?.value : null,
      }),
      new TextArea({
        id: "description",
        key: "description",
        required: true,
        value: this.dialogData?.description
          ? this.dialogData?.description
          : null,
      }),
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    this.data.value = formValues.getValues()["value"]?.value;
    this.data.description = formValues.getValues()["description"]?.value;
    this.isFormValid = formValues.isValid;
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    this.savingData = true;
    event.stopPropagation();
    this.systemSettingsService
      .updateSystemSettings(this.data)
      .subscribe((response) => {
        if (response) {
          this.savingData = false;
        }
      });
  }
}
