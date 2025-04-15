import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";

import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import { setNHIFPractitionerDetails } from "../actions/insurance-nhif-practitioner.actions";

@Injectable()
export class NHIFPractitionerEffects {
  constructor(
    private actions$: Actions,
    private insuranceService: InsuranceService
  ) {}

 
}
