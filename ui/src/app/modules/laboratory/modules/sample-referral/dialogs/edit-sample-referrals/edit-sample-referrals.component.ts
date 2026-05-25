import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { orderBy } from "lodash";
import { AppState } from 'src/app/store/reducers';
import { loadCustomOpenMRSForms } from "src/app/store/actions";
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
    this.encountersData$ = this.visitService
      .getVisitEncounterDetailsByVisitUuid({
        uuid: this.sample?.visit?.uuid,
        query: {
          v: "custom:(uuid,visitType,startDatetime,encounters:(uuid,encounterDatetime,encounterType,form:(uuid,display,formFields:(uuid,fieldNumber,fieldPart,field:(uuid,display,concept:(uuid,display,datatype,setMembers:(uuid,display,datatype))))),location,obs,orders,diagnoses,encounterProviders),stopDatetime,attributes:(uuid,display),location:(uuid,display,tags,parentLocation:(uuid,display)),patient:(uuid,display,identifiers,person,voided)",
        },
      })
      .pipe(
        map((encounters) => {
          return encounters?.filter((encounter: any) => encounter?.encounterType?.uuid === this.sampleReferralService.referralSettings()?.referralEncounterType)?.map((encounter: any) => {
            return {
              ...encounter,
              form: {
                ...encounter?.form,
                formFields: orderBy(
                  encounter?.form?.formFields?.filter(
                    (formField: any) => formField?.fieldNumber
                  ),
                  ["fieldNumber"],
                  ["asc"]
                )?.map((formField: any) => {
                  return {
                    ...formField,
                    field: {
                      ...formField?.field,
                      display: formField?.field?.display?.replace(
                        "SPECIMEN_SOURCE:",
                        ""
                      ),
                    },
                  };
                }),
              },
            };
          });
        })
      );
  }
}
