import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import {
  loginNHIFPractitioner,
  loginNHIFPractitionerSuccess,
  loginNHIFPractitionerFailure,
  logoutNHIFPractitionerSuccess,
  logoutNHIFPractitionerFailure,
  logoutNHIFPractitioner,
  clearNHIFPractitionerDetails,
} from "../actions/insurance-nhif-practitioner.actions";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
@Injectable()
export class NHIFPractitionerEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private insuranceService: InsuranceService,
    private notificationService: NotificationService
  ) {}

  //Effect for NHIF Practitioner Login
  loginNHIFPractitioner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginNHIFPractitioner),
      switchMap(({ data }) => {
        return this.insuranceService.loginNHIFPractitioner(data).pipe(
          map((response: object) => {
            return loginNHIFPractitionerSuccess({ response });
          }),
          catchError((error) => {
            const serverMessage = error?.error?.message;
            return of(
              loginNHIFPractitionerFailure({
                error: serverMessage || error.message || "Login failed",
              })
            );
          })
        );
      })
    )
  );
  //Effect for NHIF Practitioner Logout
  logoutNHIFPractitioner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logoutNHIFPractitioner),
      switchMap(({ data }) => {
        return this.insuranceService.logoutNHIFPractitioner(data).pipe(
          map((response: object) => {
            return logoutNHIFPractitionerSuccess({ response });
          }),
          catchError((error) => {
            const serverMessage = error?.error?.message;
            return of(
              logoutNHIFPractitionerFailure({
                error: serverMessage || error.message || "Logout failed",
              })
            );
          })
        );
      })
    )
  );

  clearNHIFStateOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutNHIFPractitionerSuccess),
        tap(() => {
          this.store.dispatch(clearNHIFPractitionerDetails());
          localStorage.removeItem("NHIFPractitionerDetails");
        })
      ),
    { dispatch: false }
  );
}
