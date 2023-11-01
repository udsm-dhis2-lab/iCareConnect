import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { WorkflowStateGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-workflow-state",
  templateUrl: "./workflow-state.component.html",
  styleUrls: ["./workflow-state.component.scss"],
})
export class WorkflowStateComponent implements OnInit {
  @Input() workflowState: WorkflowStateGetFull;
  @Input() patientEnrollmentDetails: any;
  forms$: Observable<any>;
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.forms$ = this.systemSettingsService.getSystemSettingsByKey(
      `iCare.programs.settings.workflowStateForms.${this.workflowState?.uuid}`
    );
  }
}
