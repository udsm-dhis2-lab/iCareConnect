import { Component, effect, inject, Injector, Input, OnDestroy, OnInit } from "@angular/core";
import { SampleReferralService } from "../../services/referral-samples.service";
import { Observable, Subject } from "rxjs";
import { LabDateService } from "src/app/modules/laboratory/services/lab-date.service";
import { formatDateToString } from "src/app/shared/helpers/format-date.helper";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { AddSampleReferralsComponent } from "../../dialogs/add-sample-referrals/add-sample-referrals.component";
import { EditSampleReferralsComponent } from "../../dialogs/edit-sample-referrals/edit-sample-referrals.component";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { loadCustomOpenMRSForms } from "src/app/store/actions";

@Component({
  selector: "app-referred-samples",
  templateUrl: "./referred-samples.component.html",
  styleUrls: ["./referred-samples.component.scss"],
})
export class ReferredSamplesComponent implements OnInit, OnDestroy {
  private injector = inject(Injector);
  private sampleReferralService = inject(SampleReferralService);
  private labDateService = inject(LabDateService);
  private dialog = inject(MatDialog);
  private store = inject(Store<AppState>);

  
  referredSamples$?: Observable<any>;
  searchText?: string;
  subject = new Subject<string>();

  referralOrderTypeUuid?: string;
  startDate?: Date;
  endDate?: Date;
  page = 1;
  pageSize = 10;
  pageCounts: number[] = [10, 20, 25, 50];

  selectedSampleUuid: string | null = null;

  constructor() {
    this.subject
          .pipe(debounceTime(2000), distinctUntilChanged())
          .subscribe(() => {
            if(this.referralOrderTypeUuid) {
              this.getSamplesByReferralOrderType(this.referralOrderTypeUuid);
            }
          });
  }

  ngOnInit(): void {
    this.reloadSampleListOnDateChange();

    this.startDate = this.labDateService.startDate();
    this.endDate = this.labDateService.endDate();
    
    this.referralOrderTypeUuid = this.sampleReferralService.referralSettings()?.referralOrderType;
    
    if (this.referralOrderTypeUuid && this.startDate && this.endDate) {
      this.getSamplesByReferralOrderType(this.referralOrderTypeUuid);
    }

    this.store.dispatch(
          loadCustomOpenMRSForms({
            formUuids: Object.values(this.sampleReferralService.referralSettings()?.forms || {}),
          })
        );
  }

  reloadSampleListOnDateChange() {
    effect(() => {
      this.startDate = this.labDateService.startDate();
      this.endDate = this.labDateService.endDate();
    
      if (this.startDate && this.endDate && this.startDate <= this.endDate) {
        this.getSamplesByReferralOrderType(this.referralOrderTypeUuid!);
      }
    }, { injector: this.injector });
  }

  getSamplesByReferralOrderType(orderTypeUuid: string) {
    this.referredSamples$ = this.sampleReferralService.getSamplesByRefferalOrderType(orderTypeUuid, {
      paging: true,
      page: this.page,
      pageSize: this.pageSize,
      startDate: formatDateToString(this.startDate, "yyyy-MM-dd"),
      endDate: formatDateToString(this.endDate, "yyyy-MM-dd"),
      haveThisOrderType: true,
      fulfillerStatus: "COMPLETED",
      q: this.searchText
    });
  }

  onPageChange(event) {
    this.page = event.pageIndex + 1;
    this.pageSize = Number(event?.pageSize);
    this.getSamplesByReferralOrderType(this.referralOrderTypeUuid!);
  }

  openReferralForm(){
    this.dialog.open(AddSampleReferralsComponent, {
      maxWidth: "80vw",
      maxHeight: "80vh",
      closeOnNavigation: false,
      disableClose: true
    }).afterClosed().subscribe((data) => {
      if(data?.formCompleted) {
        this.getSamplesByReferralOrderType(this.referralOrderTypeUuid!);
      }
    });
  }

  onViewSampleDetails(sample: any){
    this.selectedSampleUuid = sample?.uuid;
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  // onEditSample(sample: any){
  //   this.dialog.open(EditSampleReferralsComponent, {
  //     maxWidth: "80vw",
  //     maxHeight: "80vh",
  //     closeOnNavigation: false,
  //     disableClose: true,
  //     data: {
  //       sample: sample
  //     }
  //   }).afterClosed().subscribe((data) => {
  //     if(data?.formCompleted) {
  //       this.getSamplesByReferralOrderType(this.referralOrderTypeUuid!);
  //     }
  //   });
  // }

}
