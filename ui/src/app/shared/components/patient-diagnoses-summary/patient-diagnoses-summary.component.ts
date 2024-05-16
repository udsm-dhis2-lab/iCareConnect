import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { from, Observable, of } from "rxjs";
import { AppState } from "src/app/store/reducers";
import {
  getAllDiagnoses,
  getSavingDiagnosisState,
} from "src/app/store/selectors";
import { getVisitLoadingState } from "src/app/store/selectors/visit.selectors";
import { FormValue } from "../../modules/form/models/form-value.model";
import { formatDiagnosisFormObject } from "../../resources/diagnosis/helpers";
import { DiagnosisObject } from "../../resources/diagnosis/models/diagnosis-object.model";
import { Visit } from "../../resources/visits/models/visit.model";
import { map, filter, keyBy } from "lodash";
import { saveDiagnosis } from "src/app/store/actions/diagnosis.actions";
import { MatDialog } from "@angular/material/dialog";
import { AddDiagnosisModalComponent } from "../add-diagnosis-modal/add-diagnosis-modal.component";
import { DeleteDiagnosisModalComponent } from "../delete-diagnosis-modal/delete-diagnosis-modal.component";
import { getAllDiagnosesFromVisitDetails } from "../../helpers/patient.helper";
import { VisitObject } from "../../resources/visits/models/visit-object.model";

@Component({
  selector: "app-patient-diagnoses-summary",
  templateUrl: "./patient-diagnoses-summary.component.html",
  styleUrls: ["./patient-diagnoses-summary.component.scss"],
})
export class PatientDiagnosesSummaryComponent implements OnInit {
  diagnoses$: Observable<DiagnosisObject[]>;
  loadingVisit$: Observable<boolean>;
  @Input() patientVisit: VisitObject;
  @Input() isConfirmedDiagnosis: boolean;
  @Input() forConsultation: boolean;
  @Input() isInpatient: boolean;
  @Input() diagnosisFormDetails: any;
  @Input() forHistory: boolean;
  diagnosisForm: any;
  diagnosisField: any;
  diagnosisRankField: any;
  formValuesData: any = {};
  diagnosesData: any = {};
  savingDiagnosisState$: Observable<boolean>;
  @Output() updateConsultationOrder = new EventEmitter();
  @Output() updateMedicationComponent = new EventEmitter();
  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.diagnosisFormDetails) {
      this.diagnosisForm = formatDiagnosisFormObject(this.diagnosisFormDetails);
      // console.log("TEST", this.diagnosisForm);
      this.diagnosisField = (this.diagnosisForm?.formFields.filter(
        (field) => field?.key === "diagnosis"
      ) || [])[0];
      this.diagnosisRankField = (this.diagnosisForm?.formFields.filter(
        (field) => field?.key === "rank"
      ) || [])[0];
    }
    this.diagnoses$ = !this.forHistory
      ? this.store.select(getAllDiagnoses)
      : of(getAllDiagnosesFromVisitDetails(this.patientVisit));
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
  }

  onFormUpdate(formValues: FormValue, type): void {
    this.formValuesData = { ...this.formValuesData, ...formValues.getValues() };
  }

  addDiagnosis(e: Event): void {
    e.stopPropagation();
    this.diagnosisField = null;
    this.diagnosisRankField = null;
    map(Object.keys(this.formValuesData), (key) => {
      if (this.formValuesData[key]) {
        if (key === "diagnosis") {
          this.diagnosesData = {
            ...this.diagnosesData,
            [key]: {
              coded: this.formValuesData[key].value,
              nonCoded: null,
              specificName: null,
            },
          };
        } else {
          const options = this.formValuesData[key]?.options || [];
          const keyedOptions = keyBy(options, "value");
          this.diagnosesData[key] =
            keyedOptions[this.formValuesData[key].value]?.value === "Secondary"
              ? 1
              : 0;
        }
      }

      setTimeout(() => {
        this.diagnoses$ = this.store.select(getAllDiagnoses);
        this.diagnosisField = (this.diagnosisForm?.formFields.filter(
          (field) => field?.key === "diagnosis"
        ) || [])[0];
        this.diagnosisRankField = (this.diagnosisForm?.formFields.filter(
          (field) => field?.key === "rank"
        ) || [])[0];
      }, 200);
    });
    this.diagnosesData = {
      ...this.diagnosesData,
      condition: null,
      certainty: this.isConfirmedDiagnosis ? "CONFIRMED" : "PROVISIONAL",
      patient: this.patientVisit?.patientUuid,
      encounter: JSON.parse(localStorage.getItem("patientConsultation"))[
        "encounterUuid"
      ],
    };
    this.savingDiagnosisState$ = this.store.select(getSavingDiagnosisState);
    this.store.dispatch(
      saveDiagnosis({
        diagnosis: this.diagnosesData,
        currentDiagnosisUuid: null,
      })
    );
      // Check if the diagnosis is one of the surveillance diseases
  const surveillanceDiseases = [
    "Cholera",
    "Diarrhea with Blood (Dysentery)",
    "Dengue Fever",
    "Ebola or Marburg Virus Diseases ",
    "Yellow fever",
    "Small Pox"
  ];
  if (surveillanceDiseases.includes(this.diagnosesData.diagnosis)) {
    // Share the demographic information of the patient
    console.log("Sharing demographic information of the patient");
    // Add code here to share the demographic information
  }

    this.updateMedicationComponent.emit();
    this.updateConsultationOrder.emit();
  }

  onEdit(e: Event, diagnosisData, currentDiagnosisUuid) {
    this.diagnosisForm = formatDiagnosisFormObject(
      this.diagnosisFormDetails,
      diagnosisData?.diagnosisDetails
        ? diagnosisData?.diagnosisDetails
        : diagnosisData
    );
    currentDiagnosisUuid = diagnosisData?.diagnosisDetails
      ? diagnosisData?.diagnosisDetails?.uuid
      : diagnosisData?.uuid;
    // e.stopPropagation();
    this.dialog
      .open(AddDiagnosisModalComponent, {
        width: "75%",
        data: {
          patient: this.patientVisit?.patientUuid,
          diagnosisForm: this.diagnosisForm,
          visit: null,
          edit: true,
          currentDiagnosisUuid: currentDiagnosisUuid,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.updateMedicationComponent.emit();
      });
  }

  onDelete(e: Event, diagnosisData) {
    // e.stopPropagation();
    this.dialog
      .open(DeleteDiagnosisModalComponent, {
        width: "25%",
        data: {
          patient: this.patientVisit?.patientUuid,
          diagnosis: diagnosisData?.diagnosisDetails
            ? diagnosisData?.diagnosisDetails
            : diagnosisData,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.updateMedicationComponent.emit();
      });
  }
}
