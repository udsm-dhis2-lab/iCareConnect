import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import {
  NotificationService,
} from "src/app/shared/services/notification.service";
import { loadVisitType, loadVisitTypeFailure, loadVisitTypeSuccess } from "../actions/insurance-nhif-visit-types.actions";

@Injectable()
export class NHIFVisitTypeEffects {
  constructor(
    private actions$: Actions,
    private insuranceService: InsuranceService,
    private notificationService: NotificationService
  ) {}

  loadVisitType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVisitType), // Listens for the action
      switchMap((action) => {
        console.log('The visit effect is fired')
        return this.insuranceService.getListOfVisitTypes().pipe(
          map((data) => {
            return loadVisitTypeSuccess({ data });
          }), // Dispatch success action
          catchError((error) => of(loadVisitTypeFailure({ error }))) // Dispatch failure action
        );
      })
    )
  );


}
