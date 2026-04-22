import { Injectable, Optional, Inject } from "@angular/core";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { Platform } from "@angular/cdk/platform";
import { NgxMatNativeDateAdapter } from "@angular-material-components/datetime-picker";
import * as moment from "moment";

@Injectable()
export class NgxMatMomentDateAdapter extends NgxMatNativeDateAdapter {
  constructor(
    @Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string,
    platform: Platform
  ) {
    super(matDateLocale, platform);
  }

  format(date: Date, displayFormat: any): string {
    if (typeof displayFormat === "string") {
      return moment(date).format(displayFormat);
    }
    return super.format(date, displayFormat);
  }

  parse(value: any): Date | null {
    if (typeof value === "string" && value) {
      const m = moment(value, "DD-MM-YYYY HH:mm:ss", true);
      if (m.isValid()) {
        return m.toDate();
      }
      const fallback = moment(value);
      return fallback.isValid() ? fallback.toDate() : null;
    }
    return value instanceof Date ? value : null;
  }
}
