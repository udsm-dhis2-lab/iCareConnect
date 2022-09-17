import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { getObservationsFromForm } from "src/app/modules/clinic/helpers/get-observations-from-form.helper";
import { getFormattedEncountersByEncounterTypeFromVisit } from "../../helpers/visits.helper";
import { FormValue } from "../../modules/form/models/form-value.model";

@Component({
  selector: "app-observation-chart-table",
  templateUrl: "./observation-chart-table.component.html",
  styleUrls: ["./observation-chart-table.component.scss"],
})
export class ObservationChartTableComponent implements OnInit {
  @Input() selectedForm: any;
  @Input() activeVisit: any;
  @Input() obsChartEncounterType: string;
  @Input() patient: any;
  @Input() location: any;
  formData: any;
  obsChartEncountersData: any[];
  atLeastOneFormFieldHasBeenFilled: boolean = false;
  @Output() saveObservation: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.obsChartEncountersData =
      getFormattedEncountersByEncounterTypeFromVisit(
        this.activeVisit?.visit,
        this.obsChartEncounterType
      );
  }

  onFormUpdate(formValues: FormValue): void {
    const formValuesData = formValues.getValues();
    this.formData = {
      ...this.formData,
      ...formValuesData,
    };
    this.atLeastOneFormFieldHasBeenFilled =
      (
        Object.keys(this.formData)
          ?.map((key) => this.formData[key]?.value)
          ?.filter((value) => value) || []
      )?.length > 0;
  }

  onSave(event: Event): void {
    event.stopPropagation();

    const obs = getObservationsFromForm(
      this.formData,
      this.patient?.personUuid,
      this.location?.id
    );
    this.saveObservation.emit({
      obs,
      obsChartEncounterType: this.obsChartEncounterType,
      visit: this.activeVisit,
    });
  }
}
