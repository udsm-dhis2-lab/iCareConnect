import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { back, forward, go } from "../actions/router.actions";

@Injectable()
export class RouterEffects {
  constructor(
    private actions$: Actions,
    private router: Router,
    private location: Location
  ) {}

  navigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(go),
        tap(({ path, query, extras }) => {
          this.router.navigate(path, { 
            queryParams: query?.queryParams, 
            state: extras?.state
          });
        })
      ),
    { dispatch: false }
  );
}
