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
  NHIFPractitionerDetailsI,
  NHIFPractitionerLoginI,
} from "src/app/shared/resources/store/models/insurance-nhif.model";

@Injectable()
export class NHIFPractitionerEffects {
  constructor(
    private actions$: Actions,
    private insuranceService: InsuranceService
  ) {}

  //Effect for NHIF Practitioner Login
  loginNHIFPractitioner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginNHIFPractitioner),
      switchMap(({ data } ) => {
        console.log('action for login in practioner received')
        return this.insuranceService.loginNHIFPractitioner(data).pipe(
          map((practitioner: any) =>
            loginNHIFPractitionerSuccess({ practitioner })
          ),
          catchError((error) =>
            of(
              loginNHIFPractitionerFailure({
                error: error.message || "Login failed",
              })
            )
          )
        );
      })
    )
  );
}
