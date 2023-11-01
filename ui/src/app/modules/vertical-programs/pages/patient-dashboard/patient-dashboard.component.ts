import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { DiagnosisObject } from "src/app/shared/resources/diagnosis/models/diagnosis-object.model";
import { ObservationObject } from "src/app/shared/resources/observation/models/obsevation-object.model";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import { loadFormPrivilegesConfigs } from "src/app/store/actions/form-privileges-configs.actions";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import {
  getFormPrivilegesConfigs,
  getFormPrivilegesConfigsLoadingState,
} from "src/app/store/selectors/form-privileges-configs.selectors";
import { ProgramsService } from "../../services/programs.service";
import { ActivatedRoute } from "@angular/router";
import { CurrentUser } from "src/app/shared/models/current-user.models";
import {
  ProgramenrollmentGetFull,
  WorkflowGetFull,
  WorkflowStateGetFull,
} from "src/app/shared/resources/openmrs";
import { map } from "rxjs/operators";
import { loadCurrentPatient } from "src/app/store/actions";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";

@Component({
  selector: "app-patient-dashboard",
  templateUrl: "./patient-dashboard.component.html",
  styleUrls: ["./patient-dashboard.component.scss"],
})
export class PatientDashboardComponent implements OnInit {
  programs$: Observable<any>;
  enrollmentUuid: string;
  patientUuid: string;
  currentUser$: Observable<CurrentUser>;
  patientEnrollmentDetails$: Observable<ProgramenrollmentGetFull>;
  patient$: Observable<any>;
  selectedState: any;
  constructor(
    private store: Store<AppState>,
    private programService: ProgramsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.enrollmentUuid = this.activatedRoute.snapshot.params["id"];
    this.patientUuid = this.activatedRoute.snapshot.params["patient"];

    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.store.dispatch(loadCurrentPatient({ uuid: this.patientUuid }));
    this.patient$ = this.store.select(getCurrentPatient);
    this.getEnrollmentDetails();
  }

  getEnrollmentDetails(): void {
    this.patientEnrollmentDetails$ = this.programService
      .getPatientEnrollmentDetails(this.enrollmentUuid)
      .pipe(
        map((enrollment: ProgramenrollmentGetFull) => {
          return {
            ...enrollment,
            program: {
              ...enrollment?.program,
              allWorkflows: enrollment?.program?.allWorkflows?.filter(
                (workFlow: WorkflowGetFull) => !workFlow?.retired
              ),
            },
          };
        })
      );
  }

  onSelectState(event: Event, state: WorkflowStateGetFull): void {
    event.stopPropagation();
    this.selectedState = state;
  }
}
