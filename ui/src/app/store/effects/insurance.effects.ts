import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";
import {
  loadPointOfCare,
  loadPointOfCareFailure,
  loadPointOfCareSuccess,
} from "../actions/insurance.actions";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";

@Injectable()
export class PointOfCareEffects {
  constructor(
    private actions$: Actions,
    private insuranceService: InsuranceService
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
}
