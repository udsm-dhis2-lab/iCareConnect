import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { Field } from "src/app/shared/modules/form/models/field.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { DrugsService } from "src/app/shared/resources/drugs/services/drugs.service";

@Component({
  selector: "app-manage-drug-modal",
  templateUrl: "./manage-drug-modal.component.html",
  styleUrls: ["./manage-drug-modal.component.scss"],
})
export class ManageDrugModalComponent implements OnInit {
  dialogData: any;
  shouldConfirm: boolean;

  drugFormFields: Field<string>[];
  formData: any = {};
  isFormValid: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<ManageDrugModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private drugService: DrugsService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.createDrugsFormField(this.dialogData);
  }

  createDrugsFormField(data?: any): void {
    this.drugFormFields = [
      new Textbox({
        id: "drug",
        key: "drug",
        label: "Drug",
        type: "text",
        value: data && data?.display ? data?.display : null,
        required: true,
      }),
      new Dropdown({
        id: "genericDrug",
        key: "genericDrug",
        label: "Generic Drug",
        value: data && data?.concept?.uuid ? data?.concept?.uuid : null,
        required: true,
        shouldHaveLiveSearchForDropDownFields: true,
        options: [],
        searchControlType: "concept",
      }),
      new Textbox({
        id: "strength",
        key: "strength",
        label: "Strength",
        value: data && data?.strength ? data?.strength : null,
        required: true,
      }),
    ];
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event, confirmed?: boolean): void {
    event.stopPropagation();
    if (confirmed) {
    } else {
      this.shouldConfirm = true;
    }
  }

  onFormUpdate(formValue: FormValue): void {
    this.formData = formValue.getValues();
    this.isFormValid = formValue.isValid;
  }
}
