import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InsuranceService } from "src/app/shared/services";
import {
  getNHIFCardDetailsByNIN,
  authorizeNHIFCardFailure,
  authorizeNHIFCardSuccess,
  loadPointOfCare,
  loadPointOfCareFailure,
  loadPointOfCareSuccess,
  verifyPointOfCare,
  verifyPointOfCareFailure,
  verifyPointOfCareSuccess,
  authorizeNHIFCard,
  getNHIFCardDetailsByNINSuccess,
  getNHIFCardDetailsByNINFailure,
  getNHIFCardDetailsByCardNumber,
  getNHIFCardDetailsByCardNumberSuccess,
  getNHIFCardDetailsByCardNumberFailure,
} from "../actions/insurance-nhif-point-of-care.actions";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
import {
  NHIFCardAuthorizationResponseI,
  NHIFGetCardDEtailByNationalIDResponseI,
} from "src/app/shared/resources/store/models/insurance-nhif.model";

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
            if (response.status === 400) {
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

  //Effect for NHIF card authorization
  authorizeNHIFCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authorizeNHIFCard),
      switchMap(({ data }) => {
        return this.insuranceService.authorizeInsuranceCard(data).pipe(
          map(
            (response: {
              status: number;
              body: NHIFCardAuthorizationResponseI;
            }) => {
              return authorizeNHIFCardSuccess({ response });
            }
          ),
          catchError((error) => {
            this.notificationService.show(
              new Notification({
                message: "Problem authorizing NHIF card",
                type: "ERROR",
              })
            );

            return of(
              authorizeNHIFCardFailure({
                error: error.message || "Failed to authorize NHIF card",
              })
            );
          })
        );
      })
    )
  );

  //Effect for NHIF to get card details by NIDA
  getNHIFCardDetailsByNIN$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getNHIFCardDetailsByNIN),
      switchMap(({ data }) => {
        return this.insuranceService.getCardDetailsByNIN(data).pipe(
          map(
            (response: {
              status: number;
              body: NHIFGetCardDEtailByNationalIDResponseI;
            }) => {
              return getNHIFCardDetailsByNINSuccess({ response });
            }
          ),
          catchError((error) => {
            this.notificationService.show(
              new Notification({
                message: "Problem getting NHIF card by NIN",
                type: "ERROR",
              })
            );

            return of(
              getNHIFCardDetailsByNINFailure({
                error: error.message || "Failed to get NHIF card by NIN",
              })
            );
          })
        );
      })
    )
  );

  //Effect for NHIF to get card details by carrd number
  getNHIFCardDetailsByCardNumber$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getNHIFCardDetailsByCardNumber),
      switchMap(({ data }) => {
        return this.insuranceService.getCardDetailsByCardNumber(data).pipe(
          map((response: { status: number; body: object }) => {
            return getNHIFCardDetailsByCardNumberSuccess({ response });
          }),
          catchError((error) => {
            this.notificationService.show(
              new Notification({
                message: "Problem getting NHIF card by card number",
                type: "ERROR",
              })
            );

            return of(
              getNHIFCardDetailsByCardNumberFailure({
                error:
                  error.message || "Failed to get NHIF card by card number",
              })
            );
          })
        );
      })
    )
  );
}
