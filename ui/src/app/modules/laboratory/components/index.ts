import { LabSamplesStatusesComponent } from "./lab-samples-statuses/lab-samples-statuses.component";
import { LabSamplesForAcceptanceComponent } from "./lab-samples-for-acceptance/lab-samples-for-acceptance.component";
import { TechnicianWorklistComponent } from "./technician-worklist/technician-worklist.component";
import { LabResultsComponent } from "./lab-results/lab-results.component";
import { SignOffComponent } from "./sign-off/sign-off.component";
import { AllocateTechnicianModalComponent } from "./allocate-technician-modal/allocate-technician-modal.component";
import { SampleRejectionReasonComponent } from "./sample-rejection-reason/sample-rejection-reason.component";
import { SampleTestsAllocationComponent } from "./sample-tests-allocation/sample-tests-allocation.component";
import { TrackedSampleModalComponent } from "./tracked-sample-modal/tracked-sample-modal.component";
import { SamplesTrackingComponent } from "./samples-tracking/samples-tracking.component";
import { ResultsAndSignOffsModalComponent } from "./results-and-sign-offs-modal/results-and-sign-offs-modal.component";
import { CaptureLabResultsComponent } from "./capture-lab-results/capture-lab-results.component";
import { CaptureLabResultsApprovalComponent } from "./capture-lab-results-approval/capture-lab-results-approval.component";
import { SampleResultsPrintingComponent } from "./sample-results-printing/sample-results-printing.component";

export const labComponents: any[] = [
  LabSamplesStatusesComponent,
  LabSamplesForAcceptanceComponent,
  TechnicianWorklistComponent,
  LabResultsComponent,
  SignOffComponent,
  AllocateTechnicianModalComponent,
  SampleRejectionReasonComponent,
  SampleTestsAllocationComponent,
  SamplesTrackingComponent,
  TrackedSampleModalComponent,
  ResultsAndSignOffsModalComponent,
  CaptureLabResultsComponent,
  CaptureLabResultsApprovalComponent,
  SampleResultsPrintingComponent,
];

export const entryComponents: any[] = [SampleResultsPrintingComponent];
