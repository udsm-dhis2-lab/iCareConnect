import { Injectable } from "@angular/core";
import { Observable, of, zip } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { SampleAllocation } from "../models/allocation.model";

import { groupBy, flatten } from "lodash";
import { catchError, map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Injectable({
  providedIn: "root",
})
export class SampleAllocationService {
  constructor(
    private httpClient: OpenmrsHttpClientService,
    private systemSettingsService: SystemSettingsService
  ) {}

  getAllocationsBySampleUuid(uuid: string): Observable<any[]> {
    return zip(
      this.systemSettingsService
        .getSystemSettingsByKey(`iCare.laboratory.resultApprovalConfiguration`)
        .pipe(
          map((response) => response),
          catchError((error) => of(error))
        ),
      this.httpClient.get(`lab/allocationsbysample?uuid=${uuid}`)
    ).pipe(
      map((responses) => {
        const groupedAllocations = groupBy(
          responses[1]?.map((allocation) => {
            const all: SampleAllocation = new SampleAllocation({
              ...allocation,
              resultApprovalConfiguration: responses[0],
            });
            return all;
          }),
          "orderUuid"
        );
        return Object.keys(groupedAllocations).map((key) => {
          const authorizationIsReady =
            (
              flatten(
                groupedAllocations[key]?.map(
                  (allocation) => allocation?.finalResult || []
                )
              )?.filter((result) => result?.authorizationIsReady) || []
            )?.length > 0;
          return {
            ...{
              ...groupedAllocations[key][0]?.order,
              concept: {
                ...groupedAllocations[key][0]?.order?.concept,
                display:
                  groupedAllocations[key][0]?.order?.concept?.display?.indexOf(
                    ":"
                  ) > -1
                    ? groupedAllocations[
                        key
                      ][0]?.order?.concept?.display?.split(":")[1]
                    : groupedAllocations[key][0]?.order?.concept?.display,
              },
            },
            authorizationStatuses: flatten(
              groupedAllocations[key]?.map(
                (allocation) =>
                  allocation?.finalResult?.authorizationStatuses || []
              )
            ),
            authorizationIsReady,
            finalResults: flatten(
              groupedAllocations[key]?.map(
                (allocation) => allocation?.finalResult || []
              )
            ),
            allocations: groupedAllocations[key]?.map((allocation) => {
              return new SampleAllocation(allocation);
            }),
          };
        });
      })
    );
  }

  saveResultsViaAllocations(results: any): Observable<any> {
    return this.httpClient.post(`lab/multipleresults`, results).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  saveAllocationStatuses(allocationStatuses): Observable<any> {
    return this.httpClient
      .post(`lab/allocationstatuses`, allocationStatuses)
      .pipe(
        map((response) => response),
        catchError((error) => of(error))
      );
  }
}
