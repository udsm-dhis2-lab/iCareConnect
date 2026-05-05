import { Component, effect, inject, Injector, Input, OnInit } from "@angular/core";
import { SampleReferralService } from "../../services/referral-samples.service";
import { ReferralSystemSettingsService } from "../../services/referral-system-settings.service";
import { Observable } from "rxjs";
import { LabDateService } from "src/app/modules/laboratory/services/lab-date.service";
import { formatDateToString } from "src/app/shared/helpers/format-date.helper";

@Component({
  selector: "app-referred-samples",
  templateUrl: "./referred-samples.component.html",
  styleUrls: ["./referred-samples.component.scss"],
})
export class ReferredSamplesComponent implements OnInit {
  private injector = inject(Injector);
  private sampleReferralService = inject(SampleReferralService);
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);
  private labDateService = inject(LabDateService);

  
  referredSamples$?: Observable<any>;

  referralOrderTypeUuid?: string;
  startDate?: Date;
  endDate?: Date;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.reloadSampleListOnDateChange();

    this.startDate = this.labDateService.startDate();
    this.endDate = this.labDateService.endDate();
    
    this.referralOrderTypeUuid = this.referralSystemSettingsService.referralSettings()?.referralOrderType;
    
    if (this.referralOrderTypeUuid && this.startDate && this.endDate) {
      this.getSamplesByReferralOrderType(this.referralOrderTypeUuid);
    }
  }

  reloadSampleListOnDateChange() {
    effect(() => {
        console.log("Date parameters changed. Reloading referred samples list...", this.labDateService.startDate());
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
    });
  }

}
