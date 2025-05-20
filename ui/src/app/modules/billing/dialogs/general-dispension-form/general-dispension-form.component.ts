import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { uniqBy, keyBy } from "lodash";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import {
  DrugOrder,
  DrugOrderObject,
} from "src/app/shared/resources/order/models/drug-order.model";
import { map } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { getDrugsPrescribedList, getPrescriptionArrangementFields } from "src/app/store/selectors";

@Component({
  selector: "app-general-dispension-form",
  templateUrl: "./general-dispension-form.component.html",
  styleUrls: ["./general-dispension-form.component.scss"],
})
export class  implements OnInit {
  

  constructor(
    
  ) {}

  async ngOnInit() {
    
  }
}
