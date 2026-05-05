import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ReferralSystemSettingsService {

    referralSettings?: any = signal<any>({});
    
    constructor() {}
}
