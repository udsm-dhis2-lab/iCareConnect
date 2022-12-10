import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { SampleAllocation } from "../models/allocation.model";

import { groupBy, flatten } from "lodash";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SampleAllocationService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getAllocationsBySampleUuid(uuid: string): Observable<any[]> {
    return this.httpClient.get(`lab/allocationsbysample?uuid=${uuid}`).pipe(
      map((response) => {
        const groupedAllocations = groupBy(
          response?.map((allocation) => {
            const all: SampleAllocation = new SampleAllocation(allocation);
            return all;
          }),
          "orderUuid"
        );
        return Object.keys(groupedAllocations).map((key) => {
          return {
            ...groupedAllocations[key][0]?.order,
            authorizationStatuses: flatten(
              groupedAllocations[key]?.map(
                (allocation) =>
                  allocation?.finalResult?.authorizationStatuses || []
              )
            ),
            secondAuthorizationStatuses: flatten(
              groupedAllocations[key]?.map(
                (allocation) =>
                  allocation?.finalResult?.secondAuthorizationStatuses || []
              )
            ),
            allocations: groupedAllocations[key]?.map((allocation) => {
              return new SampleAllocation(allocation);
            }),
          };
        });
      }),
      catchError((error) => of(error))
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
