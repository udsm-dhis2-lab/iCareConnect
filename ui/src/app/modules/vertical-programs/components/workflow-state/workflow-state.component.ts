import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Location } from "src/app/core/models";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { CurrentUser } from "src/app/shared/models/current-user.models";
import { WorkflowStateGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-workflow-state",
  templateUrl: "./workflow-state.component.html",
  styleUrls: ["./workflow-state.component.scss"],
})
export class WorkflowStateComponent implements OnInit {
  @Input() workflowState: WorkflowStateGetFull;
  @Input() patientEnrollmentDetails: any;
  @Input() currentLocation: Location;
  @Input() currentUser: CurrentUser;
  @Input() patient: any;
  @Input() provider: any;
  forms$: Observable<any>;
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.forms$ = this.systemSettingsService.getSystemSettingsByKey(
      `iCare.programs.settings.workflowStateForms.${this.workflowState?.uuid}`
    );
  }
}
