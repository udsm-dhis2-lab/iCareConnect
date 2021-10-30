import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { groupBy } from 'lodash';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BillableItemsService {
  constructor(private httpClientService: OpenmrsHttpClientService) {}

  getItemsWithPrices(): Observable<any[]> {
    return this.httpClientService.get('icare/itemprice').pipe(
      map((response) => {
        return groupBy(
          response?.results
            ? response?.results.map((itemPrice) => {
                return {
                  itemId: itemPrice?.item?.uuid,
                  name: itemPrice?.item?.display,
                  ...itemPrice,
                };
              })
            : [] || [],
          'name'
        );
      })
    );
  }
}
