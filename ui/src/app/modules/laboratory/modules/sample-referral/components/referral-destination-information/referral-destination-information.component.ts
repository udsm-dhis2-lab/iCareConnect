import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ReferralSystemSettingsService } from '../../services/referral-system-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SamplesService } from 'src/app/shared/services/samples.service';
import { ObservationService } from 'src/app/shared/resources/observation/services';
import { OrdersService } from 'src/app/shared/resources/order/services/orders.service';
import { EncountersService } from 'src/app/shared/services/encounters.service';
import { AppState } from 'src/app/store/reducers';
import { Store } from '@ngrx/store';
import { SampleReferralService } from '../../services/referral-samples.service';
import { Observable, zip } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getCurrentUserDetails, getProviderDetails } from 'src/app/store/selectors/current-user.selectors';
import { formatDateToString } from 'src/app/shared/helpers/format-date.helper';

@Component({
  selector: 'app-referral-destination-information',
  templateUrl: './referral-destination-information.component.html',
  styleUrl: './referral-destination-information.component.scss'
})
export class ReferralDestinationInformationComponent {
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);
  private sampleReferralService = inject(SampleReferralService);
  private store = inject(Store<AppState>);
  private encounterService = inject(EncountersService);
  private orderService = inject(OrdersService);
  private observationService = inject(ObservationService);
  private sampleService = inject(SamplesService)
  private snackbar = inject(MatSnackBar);

  @Output() stepComplete = new EventEmitter<any>();
  
  unreferredSamples$?: Observable<any>;
  provider$?: Observable<any>;
  currentUser$?: Observable<any>;
  
  formId = this.referralSystemSettingsService.referralSettings()?.forms?.destination_information || null;
  orderType = this.referralSystemSettingsService.referralSettings()?.referralOrderType || null;
  encounterType = this.referralSystemSettingsService.referralSettings()?.referralEncounterType || null;
  encounterRole = this.referralSystemSettingsService.referralSettings()?.encounterRole || null;
  referralOrderConcept = this.referralSystemSettingsService.referralSettings()?.referralOrderConcept || null;
  
  loading = false;
  
  currentUser?: any;
  provider?: any;
  samples: any[] = [];

  selectedSamples: any[] = [];
  formValues: any;

  constructor(){}

  ngOnInit(){
    this.currentUser$ = this.store.select(getCurrentUserDetails).pipe(
      tap((response: any) => {
        this.currentUser = response;
      })
    );
    this.provider$ = this.store.select(getProviderDetails).pipe(
      tap((response: any) => {
        this.provider = response;
      })
    ); 
  }

  async onSaveDestinationInformation(formData: any){
    this.selectedSamples = formData?.samples;
    this.formValues = formData?.formValues;

    this.loading = true
    const sampleEncounterMap = await this.saveEncounters();
    const sampleOrdersMap = await this.saveOrders(sampleEncounterMap);
    const obsSaved = await this.saveObservations(sampleEncounterMap);
    const sampleOrders = await this.saveSampleOrders(sampleOrdersMap);

    if(obsSaved) {
      this.loading = false;
      this.stepComplete.emit()
      return;
    }
    this.loading = false;
    this.snackbar.open("Failed to save sample Information!", "", {
      duration: 3000
    })
  }
  
    async saveEncounters(){
      const selectedSamples = this.selectedSamples;
      const sampleToEncounterMap = new Map<string, string>();
  
      const encounters = selectedSamples?.map((sample: any) => {
        return {
          encounterDatetime: new Date().toISOString(),
          patient: sample?.patient?.uuid,
          encounterType: this.encounterType,
          location: sample?.location?.uuid,
          encounterProviders: [
              {
                  provider: this.provider?.uuid,
                  encounterRole: this.encounterRole
              }
          ],
          visit: sample?.visit?.uuid,
          form: this.formId
        }
      })
  
      const createdEncounters = await zip(
        ...encounters.map((encounter: any) => this.encounterService.createEncounter(encounter))
      ).toPromise()
  
      createdEncounters?.forEach((encounter: any, index: number) => {
        const sample = selectedSamples[index];
        sampleToEncounterMap.set(sample?.uuid, encounter?.uuid);
      });
  
      return sampleToEncounterMap;
    }
    
  
    async saveOrders(sampleToEncounterMap: Map<string, string>){
    const selectedSamples = this.selectedSamples;
    const sampleOrderMap = new Map<string, string>();

    const orders = selectedSamples?.map?.((sample) => {
      const encounter = sampleToEncounterMap.get(sample?.uuid);
      return { 
        encounter: encounter,
        type: "order",
        orderType: this.orderType,
        action: "NEW",
        urgency: sample?.orders?.[0]?.order?.urgency || "ROUTINE",
        careSetting: "OUTPATIENT" ,
        patient: sample?.patient?.uuid,
        concept: this.referralOrderConcept,
        orderer: this.provider?.uuid
      }
    })

    const savedOrders = await zip(
      ...orders.map((order: any) => this.orderService.createOrder(order))
    ).toPromise()

    savedOrders?.forEach((order: any, index: number) => {
      const sample = selectedSamples[index];
      sampleOrderMap.set(sample?.uuid, order?.uuid)
    });

    return sampleOrderMap;
  }
  

  async saveObservations(sampleToEncounterMap: Map<string, string>){
    const selectedSamples = this.selectedSamples;

    const observations = selectedSamples?.map((sample: any) => {
      const encounter = sampleToEncounterMap.get(sample?.uuid);
      
      return Object.values(this.formValues)?.filter((formValue: any) => !!formValue?.value)?.map((formValue: any) => {
        let value = formValue?.value;
        if(value instanceof Date ){
          value = formatDateToString(value, "YYYY-MM-DD hh:mm:ss")
        }
        return {
          encounter: encounter,
          person: sample?.patient?.uuid,
          concept: formValue?.id,
          obsDatetime: new Date().toISOString(),
          value: value
        }
      })
    })

    return await zip(...observations.map((obs) => this.observationService.saveMany(obs))).toPromise();
  }

  async saveSampleOrders(sampleOrdersMap: Map<string, string>){
    const sampleOrders = this.selectedSamples?.map((sample) => {
      return {
        sample: {
          uuid: sample?.uuid
        },
        order: {
          uuid: sampleOrdersMap.get(sample?.uuid)
        },
        technician: {
          uuid: this.currentUser?.uuid
        }
      }
    });
    
    return await zip(...sampleOrders?.map((sampleOrder) => this.sampleService.createSampleOrder(sampleOrder))).toPromise();
  }
  
}
