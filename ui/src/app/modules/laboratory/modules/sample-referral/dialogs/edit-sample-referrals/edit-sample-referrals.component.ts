import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { keyBy } from "lodash";
import { SampleReferralService } from '../../services/referral-samples.service';
import { VisitsService } from 'src/app/shared/resources/visits/services/visits.service';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-sample-referrals',
  standalone: false,
  templateUrl: './edit-sample-referrals.component.html',
  styleUrl: './edit-sample-referrals.component.scss'
})
export class EditSampleReferralsComponent {
  private sampleReferralService = inject(SampleReferralService);
  private visitService = inject(VisitsService);

  dialogRef = inject(MatDialogRef<EditSampleReferralsComponent>);
  data = inject(MAT_DIALOG_DATA);
  sample = this.data?.sample || {};
  encountersData$?: Observable<any>;
  loading: boolean =  false;

  referralForms = this.sampleReferralService.referralSettings()?.forms || {};

  constructor() {}

  ngOnInit(): void {
    this.getEncountersData();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onCompletereferralForm(){
    this.dialogRef.close({
      formCompleted: true
    });
  }

  getEncountersData(){
    this.loading = true;
    this.encountersData$ = this.visitService.getVisitEncounterDetailsByVisitUuid({
        uuid: this.sample?.visit?.uuid,
        query: {
          v: "custom:(uuid,visitType,startDatetime,encounters:(uuid,encounterDatetime,encounterType,form:(uuid,display,formFields:(uuid,fieldNumber,fieldPart,field:(uuid,display,concept:(uuid,display,datatype,setMembers:(uuid,display,datatype))))),location,obs,orders,diagnoses,encounterProviders),stopDatetime,attributes:(uuid,display),location:(uuid,display,tags,parentLocation:(uuid,display)),patient:(uuid,display,identifiers,person,voided)",
        },
      }).pipe(
        map((encounters: any) => {
          const formObs = keyBy(encounters?.filter((encounter: any) => encounter?.encounterType?.uuid === this.sampleReferralService.referralSettings()?.referralEncounterType && encounter?.form?.uuid)?.map((encounter: any) => {
            return {
              form: encounter?.form?.uuid,
              obs: encounter?.keyedObs
            }
          }), 'form');
          this.loading = false;
          return formObs;
        })
      );
  }
}
