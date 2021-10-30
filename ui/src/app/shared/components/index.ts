import { PatientProfileComponent } from './patient-profile/patient-profile.component';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { DrugOrderComponent } from './drug-order/drug-order.component';
import { LocationSelectModalComponent } from './location-select-modal/location-select-modal.component';
import { MenuComponent } from './menu/menu.component';
import { PatientClinicalNotesSummaryComponent } from './patient-clinical-notes-summary/patient-clinical-notes-summary.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientSidebarComponent } from './patient-sidebar/patient-sidebar.component';
import { PatientDiagnosesSummaryComponent } from './patient-diagnoses-summary/patient-diagnoses-summary.component';
import { AdmissionFormComponent } from './admission-form/admission-form.component';
import { TransferWithinComponent } from './transfer-within/transfer-within.component';
import { CaptureFormDataComponent } from './capture-form-data/capture-form-data.component';
import { CaptureFormDataModalComponent } from './capture-form-data-modal/capture-form-data-modal.component';
import { PatientsTabularListComponent } from './patients-tabular-list/patients-tabular-list.component';
import { PatientVitalsSummaryComponent } from './patient-vitals-summary/patient-vitals-summary.component';
import { TableComponent } from './table/table.component';
import { PatientVisitListComponent } from './patient-visit-list/patient-visit-list.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { OccupiedLocationStatusModalComponent } from './occupied-location-status-modal/occupied-location-status-modal.component';
import { PatientLabResultsSummaryComponent } from './patient-lab-results-summary/patient-lab-results-summary.component';
import { PatientDrugOrderListComponent } from './patient-drug-order-list/patient-drug-order-list.component';
import { SharedPatientConsultationComponent } from './shared-patient-consultation/shared-patient-consultation.component';
import { ActiveDiagnosesComponent } from './active-diagnoses/active-diagnoses.component';
import { OrdersOptionsFormComponent } from './orders-options-form/orders-options-form.component';
import { ClinicalNotesComponent } from './clinical-notes/clinical-notes.component';
import { PrescriptionComponent } from './prescription/prescription.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { InvestigationProcedureComponent } from './investigation-procedure/investigation-procedure.component';
import { SharedPatientDashboardComponent } from './shared-patient-dashboard/shared-patient-dashboard.component';
import { PatientVisitsHistoryComponent } from './patient-visits-history/patient-visits-history.component';
import { NewPatientProfileComponent } from './new-patient-profile/new-patient-profile.component';
import { AttendOrderedItemsComponent } from './attend-ordered-items/attend-ordered-items.component';
import { ConfirmSavingOrderObservationModalComponent } from './confirm-saving-order-observation-modal/confirm-saving-order-observation-modal.component';
import { CaptureDataComponent } from './capture-data/capture-data.component';
import { PatientVisitHistoryModalComponent } from './patient-visit-history-modal/patient-visit-history-modal.component';
import { PatientMedicationSummaryComponent } from './patient-medication-summary/patient-medication-summary.component';
import { DischargePatientModalComponent } from './discharge-patient-modal/discharge-patient-modal.component';
import { CreatePatientBedOrderModalComponent } from './create-patient-bed-order-modal/create-patient-bed-order-modal.component';
import { ProceduresHistorySummaryComponent } from './procedures-history-summary/procedures-history-summary.component';
import { TransferPatientOutsideComponent } from './transfer-patient-outside/transfer-patient-outside.component';
import { AddDiagnosisModalComponent } from './add-diagnosis-modal/add-diagnosis-modal.component';
import { DeleteDiagnosisModalComponent } from './delete-diagnosis-modal/delete-diagnosis-modal.component';
import { DrugOrderFormComponent } from './drug-order-form/drug-order-form.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SharedConceptDisplayComponent } from './shared-concept-display/shared-concept-display.component';
import { PatientVisitAttributesDetailsComponent } from './patient-visit-attributes-details/patient-visit-attributes-details.component';
import { ModulesSelectorComponent } from './modules-selector/modules-selector.component';
import { OrderResultsRendererComponent } from './order-results-renderer/order-results-renderer.component';
import { LabResultDisplayComponent } from './lab-result-display/lab-result-display.component';
import { PatientPreviousPrescriptionsComponent } from './patient-previous-prescriptions/patient-previous-prescriptions.component';
import { IsFirstVisitComponent } from './is-first-visit/is-first-visit.component';
import { UpdateVisitAttributeComponent } from './update-visit-attribute/update-visit-attribute.component';

export const components: any[] = [
  PatientSearchComponent,
  PatientProfileComponent,
  DrugOrderComponent,
  LocationSelectModalComponent,
  MenuComponent,
  PatientClinicalNotesSummaryComponent,
  PatientListComponent,
  PatientVisitListComponent,
  PatientSidebarComponent,
  PatientDiagnosesSummaryComponent,
  AdmissionFormComponent,
  TransferWithinComponent,
  CaptureFormDataComponent,
  CaptureFormDataModalComponent,
  PatientsTabularListComponent,
  PatientVitalsSummaryComponent,
  TableComponent,
  ConfirmModalComponent,
  OccupiedLocationStatusModalComponent,
  PatientLabResultsSummaryComponent,
  PatientDrugOrderListComponent,
  SharedPatientConsultationComponent,
  SharedPatientDashboardComponent,
  ActiveDiagnosesComponent,
  OrdersOptionsFormComponent,
  ClinicalNotesComponent,
  PrescriptionComponent,
  DiagnosisComponent,
  InvestigationProcedureComponent,
  PatientVisitsHistoryComponent,
  NewPatientProfileComponent,
  AttendOrderedItemsComponent,
  ConfirmSavingOrderObservationModalComponent,
  CaptureDataComponent,
  PatientVisitHistoryModalComponent,
  PatientMedicationSummaryComponent,
  DischargePatientModalComponent,
  CreatePatientBedOrderModalComponent,
  ProceduresHistorySummaryComponent,
  TransferPatientOutsideComponent,
  AddDiagnosisModalComponent,
  DeleteDiagnosisModalComponent,
  DrugOrderFormComponent,
  ChangePasswordComponent,
  SharedConceptDisplayComponent,
  PatientVisitAttributesDetailsComponent,
  ModulesSelectorComponent,
  OrderResultsRendererComponent,
  LabResultDisplayComponent,
  PatientPreviousPrescriptionsComponent,
  IsFirstVisitComponent,
  UpdateVisitAttributeComponent,
];

export const sharedEntryComponents: any[] = [
  LocationSelectModalComponent,
  CaptureFormDataModalComponent,
  AdmissionFormComponent,
  TransferWithinComponent,
  TransferPatientOutsideComponent,
  ConfirmSavingOrderObservationModalComponent,
  PatientVisitHistoryModalComponent,
  DischargePatientModalComponent,
  CreatePatientBedOrderModalComponent,
  AddDiagnosisModalComponent,
  DeleteDiagnosisModalComponent,
];

export * from './patient-vitals-summary/patient-vitals-summary.component';
