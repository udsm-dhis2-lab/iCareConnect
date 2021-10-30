import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import { loadActiveVisit } from 'src/app/store/actions/visit.actions';
import { AppState } from 'src/app/store/reducers';
import { getActiveVisit } from 'src/app/store/selectors/visit.selectors';

@Component({
  selector: 'app-update-doctors-room',
  templateUrl: './update-doctors-room.component.html',
  styleUrls: ['./update-doctors-room.component.scss'],
})
export class UpdateDoctorsRoomComponent implements OnInit {
  @Input() patient: any;
  @Input() treatmentLocations: any[];
  currentRoom: any;
  searchTerm: string = '';
  updating: boolean = false;
  updated: boolean = false;
  currentPatientVisit$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    private visitService: VisitsService
  ) {}

  ngOnInit(): void {
    this.currentPatientVisit$ = this.store.select(getActiveVisit);
  }

  onSelectRoom(event: Event, room): void {
    event.stopPropagation();
    console.log(room);
    this.currentRoom = room;
  }

  searchRoom(event: Event) {
    event.stopPropagation();
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  update(event: Event, visit): void {
    event.stopPropagation();
    const visitPayload = {
      uuid: visit?.uuid,
      location: this.currentRoom?.uuid,
    };
    this.updating = true;
    this.updated = false;
    this.visitService
      .updateVisitExisting(visitPayload)
      .subscribe((response) => {
        if (response) {
          this.updating = false;
          this.updated = true;
          this.store.dispatch(
            loadActiveVisit({ patientId: this.patient?.patient?.uuid })
          );
        }
      });
  }
}
