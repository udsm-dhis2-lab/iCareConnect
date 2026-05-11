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
  selector: 'app-referral-transport-information',
  templateUrl: './referral-transport-information.component.html',
  styleUrl: './referral-transport-information.component.scss'
})
export class ReferralTransportInformationComponent {
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
      
      formId = this.referralSystemSettingsService.referralSettings()?.forms?.transport_information || null;
      orderType = this.referralSystemSettingsService.referralSettings()?.referralOrderType || null;
      encounterType = this.referralSystemSettingsService.referralSettings()?.referralEncounterType || null;
      encounterRole = this.referralSystemSettingsService.referralSettings()?.encounterRole || null;
      referralOrderConcept = this.referralSystemSettingsService.referralSettings()?.referralOrderConcept || null;
      
      loading = false;
      
      currentUser?: any;
      provider?: any;
      samples: any[] = [];
    
      selectedSamples: any[] = [];
      formValues?: FormValue;
    
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
  
      async onSaveTransportInformation(formData: any){
        this.selectedSamples = formData?.samples;
        this.formValues = formData?.formValues;
      }
}
