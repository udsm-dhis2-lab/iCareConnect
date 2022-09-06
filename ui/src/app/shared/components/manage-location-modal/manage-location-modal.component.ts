import { Component, Inject, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormValue } from "../../modules/form/models/form-value.model";
import { Textbox } from "../../modules/form/models/text-box.model";

import { omit } from "lodash";
import { LocationService } from "src/app/core/services";
import { Dropdown } from "../../modules/form/models/dropdown.model";

@Component({
  selector: "app-manage-location-modal",
  templateUrl: "./manage-location-modal.component.html",
  styleUrls: ["./manage-location-modal.component.scss"],
})
export class ManageLocationModalComponent implements OnInit {
  dialogData: any;

  locationFields: any[] = [];
  serviceConceptsField: any;
  formValues: any = {};
  isFormValid: boolean;

  selectedTags: any = {};
  errorMessage: string;

  saving: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<ManageLocationModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private locationService: LocationService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.selectedTags[this.dialogData?.locationTag?.uuid] =
      this.dialogData?.locationTag?.uuid;
    this.locationFields = [
      new Textbox({
        id: "displayName",
        key: "displayName",
        label: "Name",
        required: true,
      }),
      new Textbox({
        id: "description",
        key: "description",
        label: "Description",
        required: true,
      }),
    ];

    this.serviceConceptsField = new Dropdown({
      id: "service",
      key: "service",
      options: [],
      label: "Service",
      conceptClass: "Service",
      searchControlType: "concept",
      value: null,
      searchTerm: "ICARE_CONSULTATION_SERVICE",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    event.stopPropagation();
    const data = {
      name: this.formValues["displayName"]?.value,
      description: this.formValues["description"]?.value,
      parentLocation: this.dialogData?.parentLocation,
      tags: Object.keys(this.selectedTags).map((key) => key) || [],
    };
    this.saving = true;
    this.locationService.createLocation(data).subscribe((response: any) => {
      if (response && !response?.error) {
        this.errorMessage = null;
        this.saving = false;
        setTimeout(() => {
          this.dialogRef.close();
        }, 2000);
      } else {
        this.saving = false;
        this.errorMessage = response?.error?.message;
      }
    });
  }

  getSelectedValue(event: MatCheckboxChange, tagUuid: string): void {
    if (event["checked"]) {
      this.selectedTags[tagUuid] = tagUuid;
    } else {
      this.selectedTags = omit(this.selectedTags);
    }
  }

  onFormUpdate(formValues: FormValue): void {
    this.isFormValid = formValues.isValid;
    this.formValues = { ...this.formValues, ...formValues.getValues() };
  }

  onFormUpdateForServices(formValues: FormValue): void {
    this.formValues = { ...this.formValues, ...formValues.getValues() };
    console.log(this.formValues);
  }
}
