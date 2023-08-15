import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation/shared-confirmation.component";
import { getFilteredIssueItems } from "src/app/shared/helpers/issuings.helper";
import { RequisitionService } from "src/app/shared/resources/store/services/requisition.service";
import { loadStockMetrics } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getMetrics } from "src/app/store/selectors";
import { RequisitionFormDialogComponent } from "../../modals/requisition-form-dialog/requisition-form-dialog.component";
@Component({
  selector: "app-stock-metrics",
  templateUrl: "./stock-metrics.component.html",
  styleUrls: ["./stock-metrics.component.scss"],
})
export class StockMetricsComponent implements OnInit {
  @Input() currentStore: any;
  @Input() currentStorePage: any;
  @Output() changeRoute: EventEmitter<any> = new EventEmitter();


  stockMetrics$: Observable<any>;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadStockMetrics());
    this.stockMetrics$ = this.store.select(getMetrics);
  }

  onChangeRoute(
    e: Event, url: string, currentStorePage: any
  ){
    this.changeRoute.emit({e: e, url: url, currentStorePage: currentStorePage})
  }
}
