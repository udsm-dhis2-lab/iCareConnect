import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Location } from "src/app/core/models";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import { AppState } from "src/app/store/reducers";
import {
  getBedsGroupedByTheCurrentLocationChildren,
  getCabinetsGroupedByTheCurrentLocationChildren,
} from "src/app/store/selectors";
import { getAllAdmittedPatientVisits } from "src/app/store/selectors/visit.selectors";

@Component({
  selector: "app-cabinets-list",
  templateUrl: "./cabinets-list.component.html",
  styleUrls: ["./cabinets-list.component.scss"],
})
export class CabinetsListComponent implements OnInit {
  @Input() currentLocation: Location;
  @Output() cabinetStatus = new EventEmitter<any>();
  @Input() cabinets: any;
  @Input() locationsIds: string[];
  @Input() encounterType: string;
  cabinetsInfo$: Observable<Location[]>;
  diedPatientsVisits$: Observable<VisitObject[]>;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.cabinetsInfo$ = this.store.select(
      getCabinetsGroupedByTheCurrentLocationChildren,
      {
        id: this.currentLocation?.id,
      }
    );

    this.diedPatientsVisits$ = this.store.select(getAllAdmittedPatientVisits);
  }

  onGetStatus(e, bed): void {
    e.stopPropagation();
    this.cabinetStatus.emit(bed);
  }
}
