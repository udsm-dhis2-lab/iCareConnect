import { Component, inject } from '@angular/core';
import { ReferralSystemSettingsService } from '../../services/referral-system-settings.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SampleReferralService } from '../../services/referral-samples.service';

@Component({
  selector: 'app-referral-sample-information',
  templateUrl: './referral-sample-information.component.html',
  styleUrl: './referral-sample-information.component.scss'
})
export class ReferralSampleInformationComponent {
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);
  private sampleReferralService = inject(SampleReferralService);

  unreferredSamples$?: Observable<any>;

  formId = this.referralSystemSettingsService.referralSettings()?.forms?.sample_information || null;
  orderType = this.referralSystemSettingsService.referralSettings()?.referralOrderType || null;

  page = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = "";

  loadingOptions = false;

  options: any[] = [];
  appendOptions = false;
  
  constructor() {}

  ngOnInit() {
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
          q: this.searchText
        }).subscribe({
          next: (response: any) => {
            this.totalCount = response?.pagination?.totalCount || 0;
            
            if(this.appendOptions){
              const existingValues = new Set(this.options.map(opt => opt.value));
              const newOptions = response?.results
                ?.map((sample: any) => ({ 
                    name: sample?.label, 
                    value: sample?.uuid 
                  }))
                ?.filter((newItem: { name: string; value: string }) => !existingValues.has(newItem.value)) || [];

                this.options = [...this.options, ...newOptions];
              } else {
                this.options = response?.results?.map((sample: any) => { 
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
    console.log("Selected sample: ", e);
  }
  

  onFormUpdate(e: any, formId: string) {
      console.log("Form data updated for form: ", formId, e);
  }

  onLoadMore() {
    console.log("Load more options");
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
}
