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
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getCurrentUserDetails, getProviderDetails } from 'src/app/store/selectors/current-user.selectors';

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
  }
}
