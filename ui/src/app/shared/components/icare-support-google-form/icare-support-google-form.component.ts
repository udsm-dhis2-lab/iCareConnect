import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Component({
  selector: "app-icare-support-google-form",
  templateUrl: "./icare-support-google-form.component.html",
  styleUrls: ["./icare-support-google-form.component.scss"],
})
export class IcareSupportGoogleFormComponent implements OnInit {
  googleFormLink$: Observable<string>;
  @Input() isSupportOpened: boolean;
  @Output() cancel = new EventEmitter<boolean>();
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.googleFormLink$ = this.systemSettingsService
      .getSystemSettingsByKey(
        "iCare.general.systemSettings.support.googleFormLink"
      )
      .pipe(
        map((response) => {
          return response?.indexOf(`http`) !== -1 ? response : "invalid";
        })
      );
  }

  onClose() {
    this.cancel.emit(false);
  }
}
