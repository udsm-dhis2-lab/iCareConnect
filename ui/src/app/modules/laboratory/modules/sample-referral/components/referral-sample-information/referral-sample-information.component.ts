import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ReferralSystemSettingsService } from '../../services/referral-system-settings.service';
import { Observable, zip } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SampleReferralService } from '../../services/referral-samples.service';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { AppState } from 'src/app/store/reducers';
import { Store } from '@ngrx/store';
import { getProviderDetails, getCurrentUserDetails } from 'src/app/store/selectors/current-user.selectors';
import { OrdersService } from 'src/app/shared/resources/order/services/orders.service';
import { EncountersService } from 'src/app/shared/services/encounters.service';
import { ObservationService } from 'src/app/shared/resources/observation/services';
import { SamplesService } from 'src/app/shared/services/samples.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-referral-sample-information',
  templateUrl: './referral-sample-information.component.html',
  styleUrl: './referral-sample-information.component.scss'
})
export class ReferralSampleInformationComponent {
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);
  private store = inject(Store<AppState>);
  private encounterService = inject(EncountersService);
  private orderService = inject(OrdersService);
  private observationService = inject(ObservationService);
  private sampleService = inject(SamplesService)
  private snackbar = inject(MatSnackBar);


  @Output() stepComplete = new EventEmitter<any>();
  
  formId = this.referralSystemSettingsService.referralSettings()?.forms?.sample_information || null;
  referralOrderConcept = this.referralSystemSettingsService.referralSettings()?.referralOrderConcept || null;
  orderType = this.referralSystemSettingsService.referralSettings()?.referralOrderType || null;
  encounterType = this.referralSystemSettingsService.referralSettings()?.referralEncounterType || null;
  encounterRole = this.referralSystemSettingsService.referralSettings()?.encounterRole || null;

  provider$?: Observable<any>;
  currentUser$?: Observable<any>;
  
  page = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = "";

  loadingOptions = false;
  loading = false;
  
  currentUser?: any;
  provider?: any;
  samples: any[] = [];

  options: any[] = [];
  appendOptions = false;

  selectedSamples: any[] = [];
  formValues?: FormValue;
  validStatus?: boolean;
  
  constructor() {}

  ngOnInit() {
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

  async onSaveSampleInformation(formData: any){
    this.selectedSamples = formData?.samples;
    this.formValues = formData?.formValues;
    
    this.loading = true
    const sampleEncounterMap = await this.saveEncounters();
    const sampleOrdersMap = await this.saveOrders(sampleEncounterMap);
    const obsSaved = await this.saveObservations(sampleEncounterMap);
    const sampleOrders = await this.saveSampleOrders(sampleOrdersMap);

    if(obsSaved && sampleOrders) {
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
      
      return Object.values(this.formValues)?.map((formValue: any) => {
        return {
          encounter: encounter,
          person: sample?.patient?.uuid,
          concept: formValue?.id,
          obsDatetime: new Date().toISOString(),
          value: formValue?.value
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
