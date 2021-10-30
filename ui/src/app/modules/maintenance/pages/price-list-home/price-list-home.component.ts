import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PaymentTypeInterface } from 'src/app/shared/models/payment-type.model';
import { loadConceptByUuid } from 'src/app/store/actions';
import { AppState } from 'src/app/store/reducers';
import { getConceptById } from 'src/app/store/selectors';
import { getAllPaymentTypes } from 'src/app/store/selectors/payment-type.selectors';

@Component({
  selector: 'app-price-list-home',
  templateUrl: './price-list-home.component.html',
  styleUrls: ['./price-list-home.component.scss'],
})
export class PriceListHomeComponent implements OnInit {
  paymentCategories$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // TODO: Move the id to configurations
    this.store.dispatch(
      loadConceptByUuid({
        uuid: 'c95c1065-bcea-4a35-aee0-ca62906ec8e2',
        fields: 'custom:(uuid,display,setMembers:(uuid,display)',
      })
    );

    this.paymentCategories$ = this.store.select(getConceptById, {
      id: 'c95c1065-bcea-4a35-aee0-ca62906ec8e2',
    });
  }
}
