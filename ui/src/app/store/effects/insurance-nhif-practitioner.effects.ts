import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import {
  loginNHIFPractitioner,
  loginNHIFPractitionerSuccess,
  loginNHIFPractitionerFailure,
} from "../actions/insurance-nhif-practitioner.actions";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
@Injectable()
export class NHIFPractitionerEffects {
  constructor(
    private actions$: Actions,
    private insuranceService: InsuranceService,
    private notificationService: NotificationService
  ) {}

  //Effect for NHIF Practitioner Login
  loginNHIFPractitioner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginNHIFPractitioner),
      switchMap(({ data }) => {
        console.log("action for login in practioner received");
        return this.insuranceService.loginNHIFPractitioner(data).pipe(
          map((response: { status: number; body: object }) => {
           
            return loginNHIFPractitionerSuccess({ response });
          }),
          catchError((error) => {
            this.notificationService.show(
              new Notification({
                message: "Problem Login in practitioner",
                type: "ERROR",
              })
            );

            return of(
              loginNHIFPractitionerFailure({
                error: error.message || "Login failed",
              })
            );
          })
        );
      })
    )
  );
}
