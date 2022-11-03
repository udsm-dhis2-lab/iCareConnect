import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { saveObservations } from "src/app/store/actions/observation.actions";
import { AppState } from "src/app/store/reducers";
import { getGroupedObservationByDateAndTimeOfIPDRounds } from "src/app/store/selectors/observation.selectors";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-shared-ipd-round-container",
  templateUrl: "./shared-ipd-round-container.component.html",
  styleUrls: ["./shared-ipd-round-container.component.scss"],
})
export class SharedIPDRoundContainerComponent implements OnInit {
  @Input() conceptUuid: string;
  @Input() activeVisit: Visit;
  @Input() location: any;
  @Input() observations: any[];
  observationsGroupedByIPDRounds$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // console.log(this.activeVisit);
    // console.log(this.conceptUuid);
    // console.log(this.observations);
    console.log(this.observations[this.conceptUuid]);
    // First create round zero provided when no any round has been made
    if (!this.observations[this.conceptUuid]) {
      const obs = [
        {
          concept: this.conceptUuid,
          value: 0,
          obsDatetime: new Date(),
          person: this.activeVisit?.patientUuid,
          location: this.location?.uuid,
          status: "PRELIMINARY",
        },
      ];
      this.store.dispatch(
        saveObservations({
          observations: obs,
          patientId: this.activeVisit?.patientUuid,
        })
      );
    }
    this.observationsGroupedByIPDRounds$ = this.store.select(
      getGroupedObservationByDateAndTimeOfIPDRounds(this.conceptUuid)
    );
  }
}
