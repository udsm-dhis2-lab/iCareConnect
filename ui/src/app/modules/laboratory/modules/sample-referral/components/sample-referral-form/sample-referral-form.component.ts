import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SampleReferralService } from '../../services/referral-samples.service';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { AppState } from 'src/app/store/reducers';
import { Store } from '@ngrx/store';
import { getProviderDetails, getCurrentUserDetails } from 'src/app/store/selectors/current-user.selectors';
import { formatDateToString } from 'src/app/shared/helpers/format-date.helper';
import { ObservationService } from 'src/app/shared/resources/observation/services';


@Component({
  selector: 'app-sample-referral-form',
  standalone: false,
  templateUrl: './sample-referral-form.component.html',
  styleUrl: './sample-referral-form.component.scss'
})
export class SampleReferralFormComponent {
  private sampleReferralService = inject(SampleReferralService);
  private store = inject(Store<AppState>);
  private observationService = inject(ObservationService);
  
  
  @Input() formId?: string;
  @Input() saveButtonText?: string;
  @Input() haveThisForm: boolean = false;
  @Input() withOrderType: boolean = false;
  @Input() combineWithOr: boolean = false;
  @Input() showMarkedOnlyField: boolean = false;
  @Input() observations?: any;
  @Input() selectedSample?: any;

  @Output() saveForm = new EventEmitter<any>();
  @Output() stepComplete = new EventEmitter<any>();

  unreferredSamples$?: Observable<any>;
  provider$?: Observable<any>;
  currentUser$?: Observable<any>;
  
  orderType = this.sampleReferralService.referralSettings()?.referralOrderType || null;
  encounterType = this.sampleReferralService.referralSettings()?.referralEncounterType || null;
  encounterRole = this.sampleReferralService.referralSettings()?.encounterRole || null;
  referralOrderConcept = this.sampleReferralService.referralSettings()?.referralOrderConcept || null;
  
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
  formValues: any;
  validStatus?: boolean;

  obsData: any = {};
  
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
    if(this.orderType){
      this.getUnreferredSamples();
    }

    this.getObsData();
  }

  getObsData(){
    if(this.observations && this.formId) {
      const keyedObs = this.observations[this.formId]?.obs;
      
      Object.keys(keyedObs || {}).forEach((key) => {
        this.obsData[key] = {
          id: key,
          value: keyedObs[key]?.latest?.value?.uuid ?? 
                isNaN(Date.parse(keyedObs[key]?.latest?.value)) ? 
                keyedObs[key]?.latest?.value : new Date(keyedObs[key]?.latest?.value)
        }
      });
    }
  }


  getUnreferredSamples(){
    this.loadingOptions = true;
    this.sampleReferralService.getSamplesByRefferalOrderType(this.orderType, {
        paging: true,
        page: this.page,
        pageSize: this.pageSize,
        haveThisOrderType: this.withOrderType,
        formUuid: this.formId,
        haveThisForm: this.haveThisForm,
        combineWithOr: this.combineWithOr,
        q: this.searchText
      }).subscribe({
      next: (response: any) => {
        this.totalCount = response?.pagination?.totalCount || 0;
        this.samples = response?.results;
        
        if(this.appendOptions){
          const existingValues = new Set(this.options.map(opt => opt.value));
          const newOptions = this.samples
            ?.map((sample: any) => ({ 
                name: sample?.label, 
                value: sample?.uuid 
              }))
            ?.filter((newItem: { name: string; value: string }) => !existingValues.has(newItem.value)) || [];

            this.options = [...this.options, ...newOptions];
          } else {
            this.options = this.samples?.map((sample: any) => { 
              return { 
                name: sample?.label, 
                value: sample?.uuid 
              }
            }) || [];
          }
          
          this.loadingOptions = false;
      },
      error: (err) => {
        console.error("Error fetching unreferred samples: ", err);
        this.loadingOptions = false;
      }
    });
  }

  onSelection(e: any) {
    this.selectedSamples = e;
  }
  
  onFormUpdate(formValue: FormValue) {
    this.validStatus = formValue.isValid;
    this.formValues = formValue?.getValues();
  }

  get isValid(){
    return (this.selectedSamples?.length  >= 1 || this.selectedSample) && this.validStatus
  }

  onLoadMore() {
    this.page++;
    this.appendOptions = true;
    this.getUnreferredSamples();
  }

  onSearchChange(searchTerm: string) {
    this.searchText = searchTerm;
    this.page = 1;
    this.appendOptions = false;
    this.getUnreferredSamples();
  }

  onToggleSamples(event: any) {
    this.withOrderType = !this.withOrderType
    this.combineWithOr = !this.combineWithOr
    this.page = 1;
    this.appendOptions = false;
    this.getUnreferredSamples();
  }


  getSelectedSamples(){
    const selectedSamples = new Set(this.selectedSamples.map(sample => sample?.value));
    return this.samples.filter(sample => selectedSamples.has(sample?.uuid));;
  }

  async onSave(){
    if(!this.isValid) return;

    if(this.selectedSamples){
      await this.updateObservations();
      return;
    }

    this.saveForm.emit({
      samples: this.getSelectedSamples(),
      formValues: this.formValues
    })
  }


  async updateObservations(){
    const observations = Object.keys(this.formValues || {}).map((key: any) => {
      const formValue = this.formValues[key];
      return {
        id: formValue?.id,
        value: formValue?.value instanceof Date ? formatDateToString(formValue?.value, "YYYY-MM-DD hh:mm:ss") : formValue?.value
      }
    });

    if(!this.formId) return;

    const updatedObs = await zip(...observations.map((observation) => {
      let obToUpdate = {
        uuid: this.observations[this.formId!]?.obs[observation?.id]?.latest?.uuid,
        value: observation?.value
      };
      return this.observationService.update(obToUpdate)
    })).toPromise();

    console.log("Updated Observations: ", updatedObs);

    updatedObs?.forEach((observation: any) => {
      this.observations[this.formId!].obs[observation.concept.uuid!].latest.value = observation?.value;
    })

    this.stepComplete.emit();
  }
}
