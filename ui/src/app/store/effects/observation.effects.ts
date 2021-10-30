import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Observation } from 'src/app/shared/resources/observation/models/observation.model';
import { ObservationService } from 'src/app/shared/resources/observation/services';
import {
  clearObservations,
  saveObservations,
  saveObservationsFail,
  saveObservationsUsingEncounter,
  upsertObservations,
} from '../actions/observation.actions';
import { AppState } from '../reducers';
import {
  NotificationService,
  Notification,
} from 'src/app/shared/services/notification.service';
import { loadActiveVisit } from '../actions/visit.actions';

@Injectable()
export class ObservationEffects {
  saveObservations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveObservations),
      // concatMap((action) => of(action).pipe(withLatestFrom(this.store.)))
      switchMap(({ observations, patientId }) => {
        this.notificationService.show(
          new Notification({
            message: 'Saving Observations...',
            type: 'LOADING',
          })
        );
        const observationsDetails = {
          obs: observations,
          encounterUuid: observations[0]?.encounter,
        };

        return this.observationService
          .saveObservationsViaEncounter(observationsDetails)
          .pipe(
            switchMap((observationResults: any) => {
              this.notificationService.show(
                new Notification({
                  message: 'Observations successfully saved!',
                  type: 'SUCCESS',
                })
              );
              return [
                upsertObservations({
                  observations: observationResults?.obs,
                }),
                loadActiveVisit({ patientId }),
              ];
            }),
            catchError((error) => {
              this.notificationService.show(
                new Notification({
                  message: 'Error saving observations!',
                  type: 'ERROR',
                })
              );

              return of(saveObservationsFail({ error }));
            })
          );
      })
    )
  );

  saveObservationsUsingEncounter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveObservationsUsingEncounter),
      // concatMap((action) => of(action).pipe(withLatestFrom(this.store.)))
      switchMap(({ data, patientId }) => {
        this.notificationService.show(
          new Notification({
            message: 'Saving Observations...',
            type: 'LOADING',
          })
        );

        return this.observationService.saveEncounterWithObsDetails(data).pipe(
          switchMap((observationResults: any) => {
            this.notificationService.show(
              new Notification({
                message: 'Observations successfully saved!',
                type: 'SUCCESS',
              })
            );
            return [
              upsertObservations({
                observations: observationResults?.obs,
              }),
              loadActiveVisit({ patientId }),
            ];
          }),
          catchError((error) => {
            this.notificationService.show(
              new Notification({
                message: 'Error saving observations!',
                type: 'ERROR',
              })
            );

            return of(saveObservationsFail({ error }));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private observationService: ObservationService,
    private store: Store<AppState>,
    private notificationService: NotificationService
  ) {}
}
