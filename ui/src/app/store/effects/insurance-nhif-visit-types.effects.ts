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

  //Effect for NHIF Practitioner Login
//   verifyPointOfCare$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(verifyPointOfCare),
//       switchMap(({ data }) => {
//         return this.insuranceService.verifyPointOfCare(data).pipe(
//           map((response: { status: number; body: object }) => {
//             if ((response.status = 400)) {
//               this.notificationService.show(
//                 new Notification({
//                   message: response.body["message"],
//                   type: "ERROR",
//                 })
//               );
//             }
//             return verifyPointOfCareSuccess({ response });
//           }),
//           catchError((error) => {
//             this.notificationService.show(
//               new Notification({
//                 message: "Problem Verifying point of care",
//                 type: "ERROR",
//               })
//             );

//             return of(
//               verifyPointOfCareFailure({
//                 error: error.message || "Login failed",
//               })
//             );
//           })
//         );
//       })
//     )
//   );
}
