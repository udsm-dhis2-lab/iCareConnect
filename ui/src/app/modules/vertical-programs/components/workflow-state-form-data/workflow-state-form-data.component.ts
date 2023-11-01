import { Component, Input, OnInit } from "@angular/core";
import { WorkflowStateGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-workflow-state-form-data",
  templateUrl: "./workflow-state-form-data.component.html",
  styleUrls: ["./workflow-state-form-data.component.scss"],
})
export class WorkflowStateFormDataComponent implements OnInit {
  @Input() forms: any[];
  @Input() workflowState: WorkflowStateGetFull;
  @Input() patientEnrollmentDetails: any;
  constructor() {}

  ngOnInit(): void {}
}
