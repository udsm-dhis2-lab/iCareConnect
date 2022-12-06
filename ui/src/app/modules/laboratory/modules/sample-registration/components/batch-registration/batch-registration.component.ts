import { Component, Input, OnInit } from '@angular/core';
import { Dropdown } from 'src/app/shared/modules/form/models/dropdown.model';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { TextArea } from 'src/app/shared/modules/form/models/text-area.model';
import { Textbox } from 'src/app/shared/modules/form/models/text-box.model';

@Component({
  selector: "app-batch-registration",
  templateUrl: "./batch-registration.component.html",
  styleUrls: ["./batch-registration.component.scss"],
})
export class BatchRegistrationComponent implements OnInit {
  @Input() mrnGeneratorSourceUuid: any;
  @Input() preferredPersonIdentifier: any;
  @Input() provider: any;
  @Input() agencyConceptConfigs: any;
  @Input() referFromFacilityVisitAttribute: any;
  @Input() currentUser: any;
  @Input() labNumberCharactersCount: any;
  @Input() referringDoctorAttributes: any;
  @Input() labSections: any;
  @Input() testsFromExternalSystemsConfigs: any;
  formData: any;
  useExistingBatchset: boolean = false;
  addFixedField: Dropdown;
  addStaticField: Dropdown;
  batchSetField: Textbox;
  batchSetDescription: Textbox;
  existingBatchsetField: TextArea;
  selectedField: Dropdown;

  constructor() {}

  ngOnInit(): void {
    this.selectedField = new Dropdown({
      id: "selectedFieldTest",
      key: "selectedFieldTest",
      label: "Selected Field",
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
    });


    this.addFixedField = new Dropdown({
      id: "addFixedField",
      key: "addFixedField",
      label: "Select fixed field",
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.addStaticField = new Dropdown({
      id: "addStaticField",
      key: "addStaticField",
      label: "Select static field",
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.batchSetField = new Textbox({
      id: "batchSetName",
      key: "batchSetName",
      label: "Batch Set Name",
    });

    this.batchSetDescription = new TextArea({
      id: "batchSetDescription",
      key: "batchSetDescription",
      label: "Batchset Description",
    });

    this.existingBatchsetField = new Dropdown({
      id: "existingBatchset",
      key: "existingBatchSet",
      label: "Select exising batch set",
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onUseExistingBatchset(e: any){
    this.useExistingBatchset = !this.useExistingBatchset;
  };

  onFormUpdate(formValues: FormValue): void {
    //Validate Date fields
    this.formData = { ...this.formData, ...formValues.getValues() };
  }
}