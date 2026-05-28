import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
import { formatDateToString } from 'src/app/shared/helpers/format-date.helper';

@Component({
  selector: 'app-referral-sample-information',
  templateUrl: './referral-sample-information.component.html',
  styleUrl: './referral-sample-information.component.scss'
})
export class ReferralSampleInformationComponent {
  private sampleReferralSettings = inject(SampleReferralService);
  private store = inject(Store<AppState>);
  private encounterService = inject(EncountersService);
  private orderService = inject(OrdersService);
  private observationService = inject(ObservationService);
  private sampleService = inject(SamplesService)
  private snackbar = inject(MatSnackBar);

  @Input() observations?: any;
  @Input() selectedSample?: any;

  @Output() stepComplete = new EventEmitter<any>();
  
  formId = this.sampleReferralSettings.referralSettings()?.forms?.sample_information || null;
  referralOrderConcept = this.sampleReferralSettings.referralSettings()?.referralOrderConcept || null;
  orderType = this.sampleReferralSettings.referralSettings()?.referralOrderType || null;
  encounterType = this.sampleReferralSettings.referralSettings()?.referralEncounterType || null;
  encounterRole = this.sampleReferralSettings.referralSettings()?.encounterRole || null;

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
  markingEncounters: Map<String, Object> = new Map<String, Object>();
  markingOrders: Map<String, Object> = new Map<String, Object>();
  
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
    let encountersWithoutFormId: any = []

    const encounters = selectedSamples?.map((sample: any) => {
      if(sample?.orders?.length){
          const encounterWithoutForm: any = sample?.orders?.filter((order: any) => order?.order?.encounter?.encounterType?.uuid === this.encounterType && !order?.order?.encounter?.form)?.length || 0;
          if(!encounterWithoutForm){
            encountersWithoutFormId = [
              ...encountersWithoutFormId,
              {
              sample: sample?.uuid,
              encounter: {
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
                  visit: sample?.visit?.uuid
                }
              }
            ]
          }
      }

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


    await zip(
      ...encountersWithoutFormId.map((encounter: any) => this.encounterService.createEncounter(encounter?.encounter).pipe(
        tap((createdEncounter: any) => {
          this.markingEncounters.set(encounter?.sample, createdEncounter);
        })
      ))
    ).toPromise()

    // createdEncounters?.filter((encounter: any) => !!encounter?.form)?.forEach((encounter: any, index: number) => {
    createdEncounters?.forEach((encounter: any, index: number) => {
      const sample = selectedSamples[index];
      sampleToEncounterMap.set(sample?.uuid, encounter);
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
      }
    )

    const markingOrders = this.selectedSamples?.filter((sample) => this.markingEncounters.has(sample?.uuid))?.map((sample) => {
        const encounter: any = this.markingEncounters.get(sample?.uuid);
          return {
            sample: sample?.uuid,
            order: { 
              encounter: encounter?.uuid,
              type: "order",
              orderType: this.orderType,
              action: "NEW",
              urgency: sample?.orders?.[0]?.order?.urgency || "ROUTINE",
              careSetting: "OUTPATIENT" ,
              patient: sample?.patient?.uuid,
              concept: this.referralOrderConcept,
              orderer: this.provider?.uuid
            }
          }
        }
      )

    await zip(
      ...markingOrders.map((markingOrder: any) => this.orderService.createOrder(markingOrder.order).pipe(
          tap((createdOrder: any) => {
            this.markingOrders.set(markingOrder?.sample, createdOrder);
          })
      ))
    ).toPromise()

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
    const sampleOrders: any[] = [];
    
    (this.selectedSamples || []).forEach((sample) => {
        if(this.markingOrders.has(sample?.uuid)){
          const markingOrder: any = this.markingOrders.get(sample?.uuid);
          sampleOrders.push(
            {
              sample: {
                uuid: sample?.uuid
              },
              order: {
                uuid: markingOrder?.uuid
              },
              technician: {
                uuid: this.currentUser?.uuid
              }
            }
          )
        }

        sampleOrders.push({
          sample: {
            uuid: sample?.uuid
          },
          order: {
            uuid: sampleOrdersMap.get(sample?.uuid)
          },
          technician: {
            uuid: this.currentUser?.uuid
          }
        })
      })
    
    return await zip(...sampleOrders?.map((sampleOrder) => this.sampleService.createSampleOrder(sampleOrder))).toPromise();
  }
}
