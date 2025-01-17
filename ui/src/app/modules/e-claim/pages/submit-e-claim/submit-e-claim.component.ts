import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import { AppState } from 'src/app/store/reducers';
import { getActiveVisitUuid } from 'src/app/store/selectors/visit.selectors';

@Component({
  selector: 'app-submit-e-claim',
  templateUrl: './submit-e-claim.component.html',
  styleUrls: ['./submit-e-claim.component.scss'],
})
export class SubmitEClaimComponent implements OnInit {
  patientUuid: string;
  activeVisitDetails$: Observable<string>;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientUuid = params['patientId'];
      this.loadPatientData();
    });
  }

    loadPatientData(): void {
      this.activeVisitDetails$ = this.visitService.getActiveVisit(
        this.patientUuid,
        false,
        false,
      );
    }
  }
