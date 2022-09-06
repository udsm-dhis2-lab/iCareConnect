import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { InvestigationProcedureService } from "src/app/shared/resources/investigation-procedure/services/investigation-procedure.service";
import {
  addCollectedLabOrders,
  addLabDepartments,
  addLabOrders,
  addLoadedLabOrdersInformation,
  addSampleRejectionCodesReasons,
  addTestContainers,
  createLabOrder,
  createLabOrders,
  creatingLabOrdersFail,
  deleteLabOrder,
  loadingLabOrderInformationFails,
  loadLabOrders,
  loadLabOrdersMetaDataDependencies,
  removeLabOrder,
  upsertLabOrder,
  upsertLabOrders,
  voidLabOrder,
  voidOrder,
} from "../actions";
import { switchMap, map, catchError } from "rxjs/operators";
import { of } from "rxjs";

import * as _ from "lodash";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
import { loadActiveVisit } from "../actions/visit.actions";
import { VisitsService } from "src/app/shared/services/visits.service";
import { OrdersService } from "src/app/shared/resources/order/services/orders.service";

@Injectable()
export class LabOrdersEffects {
  constructor(
    private actions$: Actions,
    private notificationService: NotificationService,
    private investigationProcedureService: InvestigationProcedureService,
    private visitService: VisitsService,
    private ordersService: OrdersService
  ) {}

  labOrderCreateUsingEncounter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createLabOrders),
      switchMap((action) => {
        this.notificationService.show(
          new Notification({
            message: "Saving orders",
            type: "LOADING",
          })
        );
        const data = {
          uuid: action.orders[0]?.encounter,
          orders: action.orders.map((order) => {
            const formattedOrder = _.omit(order, "encounter");
            return formattedOrder;
          }),
        };
        return this.investigationProcedureService
          .saveOrdersUsingEncounter(data, action.orders[0]?.encounter)
          .pipe(
            switchMap((labOrdersResponse: any) => {
              this.notificationService.show(
                new Notification({
                  message: "Saved successfully",
                  type: "SUCCESS",
                })
              );

              const newLabOrders = action.orders;
              return [
                upsertLabOrders({
                  labOrders: newLabOrders,
                }),
              ];
            }),
            catchError((error) => {
              if (error && error.hasOwnProperty("error")) {
                this.notificationService.show(
                  new Notification({
                    message: "Failed",
                    type: "ERROR",
                  })
                );
              }
              return of(
                creatingLabOrdersFail({ error, failedOrder: action.orders })
              );
            })
          );
      })
    )
  );

  deleteOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(voidOrder),
      switchMap((action) => {
        this.notificationService.show(
          new Notification({
            message: "Deleting order",
            type: "LOADING",
          })
        );
        return this.investigationProcedureService
          .discontinueOrder(action?.order)
          .pipe(
            map((response) => {
              this.notificationService.show(
                new Notification({
                  message: "Deleted successfully",
                  type: "SUCCESS",
                })
              );
              return removeLabOrder({ orderUuid: action.order?.previousOrder });
            })
          );
      })
    )
  );

  deleteLabOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteLabOrder),
      switchMap((action) => {
        return this.ordersService.deleteOrder(action.uuid).pipe(
          map((response) => {
            console.log(response);
            return voidLabOrder({ uuid: action.uuid });
          })
        );
      })
    )
  );

  metadataDependencies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLabOrdersMetaDataDependencies),
      switchMap((action) =>
        this.visitService.getLabOrdersMetadataDependencies(action.configs).pipe(
          switchMap((responses) => {
            const testContainers = keyLevelTwoConceptSetMembers(
              responses[0]?.setMembers
            );
            const codedSampleRejectionReasons = responses[1]["answers"];
            const labDepartments = responses[2]?.setMembers;
            return [
              addTestContainers({ testContainers }),
              addSampleRejectionCodesReasons({ codedSampleRejectionReasons }),
              addLabDepartments({ labDepartments }),
            ];
          })
        )
      )
    )
  );
}

function keyLevelTwoConceptSetMembers(members) {
  let testToContainers = {};
  _.map(members, (member) => {
    _.map(member?.setMembers, (container) => {
      testToContainers[container?.uuid] = {
        ...member,
      };
    });
  });
  return testToContainers;
}

function formatResults(results) {
  // console.log(results);
  return _.map(results, (result) => {
    if (!result?.creator?.display) {
      // console.log("result with undefined :: ",result);
    }

    return {
      value: result?.valueText
        ? result?.valueText
        : result.valueCoded
        ? result?.valueCoded?.uuid
        : result?.valueNumeric?.toString(),
      ...result,
      resultsFedBy: {
        name: result?.creator?.display
          ? result?.creator?.display.split("(")[0]
          : "",
        uuid: result?.creator?.uuid,
      },
    };
  });
}

function getResultsCommentsStatuses(statuses) {
  return _.filter(statuses, (status) => {
    if (status?.status != "APPROVED" && status?.status != "REJECTED") {
      return status;
    }
  });
}
