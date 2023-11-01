import { Component, Input, OnInit } from "@angular/core";
import { WorkflowStateGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-workflow-state-forms",
  templateUrl: "./workflow-state-forms.component.html",
  styleUrls: ["./workflow-state-forms.component.scss"],
})
export class WorkflowStateFormsComponent implements OnInit {
  @Input() forms: any;
  @Input() workflowState: WorkflowStateGetFull;
  @Input() patientEnrollmentDetails: any;
  constructor() {}

  ngOnInit(): void {}
}
