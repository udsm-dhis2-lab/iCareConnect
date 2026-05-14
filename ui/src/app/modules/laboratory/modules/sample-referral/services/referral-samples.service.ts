import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { BASE_URL } from "src/app/shared/constants/constants.constants";

@Injectable({
  providedIn: "root",
})
export class SampleReferralService {
    constructor(
        private httpClient: HttpClient,
        private systemSettingsService: SystemSettingsService
    ) {}


    getSamplesByRefferalOrderType(orderTypeUuid: string, params: {
         paging: boolean;
         page?: number;
         pageSize?: number;
         startDate?: string;
         endDate?: string;
         haveThisOrderType?: boolean;
         formUuid?: string,
         haveThisForm?: boolean,
         combineWithOr?: boolean,
         q?: string;
     } = {
         paging: true,
         page: 1,
         pageSize: 10,
     }) {
        let parameters = new HttpParams();
        (Object.keys(params) as Array<keyof typeof params>).forEach((key) => {
        const value = params[key];
            if (value !== undefined && value !== null) {
                parameters = parameters.set(key, String(value));
            }
        });
        return this.httpClient.get(BASE_URL + `lab/order-type/${orderTypeUuid}/samples`, { params: parameters });
    }

    getReferralSettings(){
        return this.systemSettingsService.getSystemSettingsByKey("iCare.laboratory.sampleReferral.settings.referralForm")
    }
}