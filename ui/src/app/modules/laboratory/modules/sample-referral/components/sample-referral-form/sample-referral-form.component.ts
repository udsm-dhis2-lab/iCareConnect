import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ReferralSystemSettingsService } from '../../services/referral-system-settings.service';
import { Observable, zip } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SampleReferralService } from '../../services/referral-samples.service';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { AppState } from 'src/app/store/reducers';
import { Store } from '@ngrx/store';
import { getProviderDetails, getCurrentUserDetails } from 'src/app/store/selectors/current-user.selectors';


@Component({
  selector: 'app-sample-referral-form',
  standalone: false,
  templateUrl: './sample-referral-form.component.html',
  styleUrl: './sample-referral-form.component.scss'
})
export class SampleReferralFormComponent {
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);
  private sampleReferralService = inject(SampleReferralService);
  private store = inject(Store<AppState>);
  
  @Input() formId?: string;
  @Input() saveButtonText?: string;

  @Output() saveForm = new EventEmitter<any>();

  unreferredSamples$?: Observable<any>;
  provider$?: Observable<any>;
  currentUser$?: Observable<any>;
  
  orderType = this.referralSystemSettingsService.referralSettings()?.referralOrderType || null;
  encounterType = this.referralSystemSettingsService.referralSettings()?.referralEncounterType || null;
  encounterRole = this.referralSystemSettingsService.referralSettings()?.encounterRole || null;
  referralOrderConcept = this.referralSystemSettingsService.referralSettings()?.referralOrderConcept || null;
  
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
  }


  getUnreferredSamples(){
    this.loadingOptions = true;
    this.sampleReferralService.getSamplesByRefferalOrderType(this.orderType, {
          paging: true,
          page: this.page,
          pageSize: this.pageSize,
          haveThisOrderType: false,
          formUuid: this.formId,
          haveThisForm: false,
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
    return this.selectedSamples?.length  >= 1 && this.validStatus
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


  getSelectedSamples(){
    const selectedSamples = new Set(this.selectedSamples.map(sample => sample?.value));
    return this.samples.filter(sample => selectedSamples.has(sample?.uuid));;
  }

  onSave(){
    this.saveForm.emit({
      samples: this.getSelectedSamples(),
      formValues: this.formValues
    })
  }
}
