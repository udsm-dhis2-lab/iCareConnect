import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { Textbox } from "../../modules/form/models/text-box.model";
import { GeneralDispensingFormComponent } from "../../dialogs/general-dispension-form/general-dispension-form.component";

@Component({
  selector: "app-unit-field",
  templateUrl: "./unit-field.component.html",
  styleUrls: ["./unit-field.component.scss"],
})
export class UnitFieldComponent implements OnInit {
  @Input() dosingUnits: any;
  @Input() durationUnits: any;
  @Input() drugRoutes: any;
  @Input() dosingFrequencies: any;

  @Output() formUpdate = new EventEmitter();
  unitField: Dropdown;

  constructor(
    private GeneralDispensingFormComponent: GeneralDispensingFormComponent
  ) {}

  ngOnInit(): void {
    if (this.dosingUnits) {
      this.unitField = new Dropdown({
        id: "dosingUnit",
        key: "dosingUnit",
        label: `Select Dose Unit`,
        conceptClass: this.dosingUnits?.conceptClass?.display,
        value: "tablet",
        options: this.dosingUnits?.answers?.map((answer) => {
          return {
            key: answer?.uuid,
            value: answer?.uuid,
            label: answer?.display,
          };
        }),
      });
    }

    if (this.dosingFrequencies) {
      this.unitField = new Dropdown({
        id: "frequency",
        key: "frequency",
        label: `Select dosing frequency`,
        conceptClass: this.dosingFrequencies?.conceptClass?.display,
        value: null,
        options: this.dosingFrequencies?.answers?.map((answer) => {
          return {
            key: answer?.uuid,
            value: answer?.uuid,
            label: answer?.display,
          };
        }),
      });
    }

    if (this.durationUnits) {
      this.unitField = new Dropdown({
        id: "durationUnit",
        key: "durationUnit",
        label: `Select Duration Unit`,
        conceptClass: this.durationUnits?.conceptClass?.display,
        value: null,
        options: this.durationUnits?.answers?.map((answer) => {
          return {
            key: answer?.uuid,
            value: answer?.uuid,
            label: answer?.display,
          };
        }),
      });
    }

    if (this.drugRoutes) {
      this.unitField = new Dropdown({
        id: "route",
        key: "route",
        label: `Select drug route`,
        conceptClass: this.drugRoutes?.conceptClass?.display,
        value: null,
        options: this.drugRoutes?.setMembers?.map((member) => {
          return {
            key: member?.uuid,
            value: member?.uuid,
            label: member?.display,
          };
        }),
      });
    }
  }

  onFormUpdate(e: any) {
    this.formUpdate.emit(e);
    if (this.dosingUnits) {
      this.unitField = new Textbox({
        id: "dosingUnit",
        key: "dosingUnit",
        label: `Dose Unit`,
        value: this.GeneralDispensingFormComponent.formValues.drug.value.name,
      });
    }
  }
}
