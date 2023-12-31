import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import {
  addLoadedLISConfigs,
  loadingLISConfigsFails,
  loadLISConfigurations,
} from "../actions";
import { LISConfigurationsService } from "src/app/core/services/lis-configurations.service";

@Injectable()
export class LISEffects {
  LISConfigs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLISConfigurations),
      switchMap(() =>
        this.LISConfigsService.getLISConfigurations().pipe(
          map((response) => {
            return addLoadedLISConfigs({ LISConfigs: response });
          }),
          catchError((error) => of(loadingLISConfigsFails({ error })))
        )
      )
    )
  );
  constructor(
    private actions$: Actions,
    private LISConfigsService: LISConfigurationsService
  ) {}
}
