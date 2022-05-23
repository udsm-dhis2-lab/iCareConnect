import { BatchRegistrationComponent } from "./batch-registration/batch-registration.component";
import { ClinicalDataComponent } from "./clinical-data/clinical-data.component";
import { LbOptionSelectorComponent } from "./lb-option-selector/lb-option-selector.component";
import { PersonDetailsComponent } from "./person-details/person-details.component";
import { RegisterSampleComponent } from "./register-sample/register-sample.component";
import { RegisteredPatientDetailsComponent } from "./registered-patient-details/registered-patient-details.component";
import { SampleLabelComponent } from "./sample-label/sample-label.component";
import { SingleRegistrationComponent } from "./single-registration/single-registration.component";

export const sampleRegistrationComponents: any[] = [
  RegisterSampleComponent,
  SingleRegistrationComponent,
  BatchRegistrationComponent,
  SampleLabelComponent,
  LbOptionSelectorComponent,
  PersonDetailsComponent,
  ClinicalDataComponent,
  RegisteredPatientDetailsComponent,
];
