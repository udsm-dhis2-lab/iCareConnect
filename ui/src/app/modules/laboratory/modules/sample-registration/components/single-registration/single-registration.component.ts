import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { LabTestsService } from "src/app/modules/laboratory/resources/services/lab-tests.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-single-registration",
  templateUrl: "./single-registration.component.html",
  styleUrls: ["./single-registration.component.scss"],
})
export class SingleRegistrationComponent implements OnInit {
  labSampleLabel$: Observable<string>;

  departmentField: any = {};
  formData: any = {};
  testsUnderDepartment$: Observable<any[]>;
  constructor(
    private samplesService: SamplesService,
    private labTestsService: LabTestsService
  ) {}

  ngOnInit(): void {
    this.labSampleLabel$ = this.samplesService.getSampleLabel();

    this.departmentField = new Dropdown({
      id: "department",
      key: "department",
      label: "Select department",
      options: [],
      conceptClass: "Lab Department",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onFormUpdate(formValues: FormValue, itemKey?: string): void {
    console.log(formValues.getValues());
    this.formData = { ...this.formData, ...formValues.getValues() };
    if (itemKey === "department") {
      this.testsUnderDepartment$ = this.labTestsService.getLabTestsByDepartment(
        this.formData["department"]?.value
      );
    }
  }
}
