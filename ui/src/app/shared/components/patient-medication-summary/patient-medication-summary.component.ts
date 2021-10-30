import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/reducers';
import { getAllUniqueDrugOrders } from 'src/app/store/selectors';
import { OrdersService } from '../../resources/order/services/orders.service';
import { Visit } from '../../resources/visits/models/visit.model';

@Component({
  selector: 'app-patient-medication-summary',
  templateUrl: './patient-medication-summary.component.html',
  styleUrls: ['./patient-medication-summary.component.scss'],
})
export class PatientMedicationSummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  drugOrders$: Observable<any[]>;
  constructor(
    private store: Store<AppState>,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    // TODO: Remove hardcoding for order type
    this.drugOrders$ = this.ordersService.getOrdersByVisitAndOrderType({
      visit: this.patientVisit?.uuid,
      orderType: 'iCARESTS-PRES-1111-1111-525400e4297f',
    });
  }
}
