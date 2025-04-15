import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";
import {
  loadPointOfCare,
  loadPointOfCareFailure,
  loadPointOfCareSuccess,
  verifyPointOfCare,
  verifyPointOfCareFailure,
  verifyPointOfCareSuccess,
} from "../actions/insurance-nhif-point-of-care.actions";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";

@Injectable()
export class PointOfCareEffects {
  constructor(
    private actions$: Actions,
    private insuranceService: InsuranceService,
    private notificationService: NotificationService
  ) {}

  loadPointOfCare$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPointOfCare), // Listens for the action
      switchMap((action) => {
        return this.insuranceService.getListOfPointOfcare().pipe(
          map((data) => {
            return loadPointOfCareSuccess({ data });
          }), // Dispatch success action
          catchError((error) => of(loadPointOfCareFailure({ error }))) // Dispatch failure action
        );
      })
    )
  );

  //Effect for NHIF Practitioner Login
  verifyPointOfCare$ = createEffect(() =>
    this.actions$.pipe(
      ofType(verifyPointOfCare),
      switchMap(({ data }) => {
        return this.insuranceService.verifyPointOfCare(data).pipe(
          map((response: { status: number; body: object }) => {
            if ((response.status = 400)) {
              this.notificationService.show(
                new Notification({
                  message: response.body["message"],
                  type: "ERROR",
                })
              );
            }
            return verifyPointOfCareSuccess({ response });
          }),
          catchError((error) => {
            this.notificationService.show(
              new Notification({
                message: "Problem Verifying point of care",
                type: "ERROR",
              })
            );

            return of(
              verifyPointOfCareFailure({
                error: error.message || "Login failed",
              })
            );
          })
        );
      })
    )
  );
}
