import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { FormValue } from "../../modules/form/models/form-value.model";
import { OrdersService } from "../../resources/order/services/orders.service";
import { Visit } from "../../resources/visits/models/visit.model";
import { VisitsService } from "../../resources/visits/services";
import { flatten, orderBy, uniqBy } from "lodash";

@Component({
  selector: "app-patient-observations-chart",
  templateUrl: "./patient-observations-chart.component.html",
  styleUrls: ["./patient-observations-chart.component.scss"],
})
export class PatientObservationsChartComponent implements OnInit {
  formValuesData: { [id: string]: { id: string; value: string; options: any[]; }; };
 
  constructor(
    private ordersService: OrdersService,
    private visitService: VisitsService
  ) {}

  ngOnInit(): void {
 
  }

  onFormUpdate(formValues: FormValue): void {
    this.formValuesData = formValues.getValues();
    
   }



  onSave(event: Event): void {
  }
}
