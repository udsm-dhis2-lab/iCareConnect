import { Injectable } from '@angular/core';
import { from, Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { Api, ObsCreate, ObsUpdate } from '../../openmrs';
import { Observation } from '../models/observation.model';

@Injectable({
  providedIn: 'root',
})
export class ObservationService {
  constructor(private api: Api, private httpClient: OpenmrsHttpClientService) {}

  create(observation: ObsCreate): Observable<Observation> {
    return from(this.api.obs.createObs(observation)).pipe(
      map((observationResponse) => new Observation(observationResponse))
    );
  }

  update(observation: ObsUpdate): Observable<Observation> {
    return from(this.api.obs.updateObs(observation.uuid, observation)).pipe(
      map((res) => {
        return res;
      })
    );
  }

  saveMany(observations: ObsCreate[] | ObsUpdate[]): Observable<Observation[]> {
    return zip(
      ...(observations || []).map((observation) => {
        // TODO: Add logic for updating observations
        return this.create(observation);
      })
    );
  }

  saveObservationsViaEncounter(details): Observable<any> {
    return this.httpClient.post('encounter/' + details['encounterUuid'], {
      obs: details['obs'],
    });
  }

  saveEncounterWithObsDetails(data): Observable<any> {
    return this.httpClient.post('encounter', data);
  }
}
