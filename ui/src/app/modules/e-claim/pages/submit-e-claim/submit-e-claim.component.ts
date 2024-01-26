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
    private visitService: VisitsService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.patientUuid = this.route.snapshot.params['patientId'];
    this.activeVisitDetails$ = this.visitService.getActiveVisit(
      this.patientUuid,
      false,
      false,
      false
    );
  }

 
  submitClaim() {
    const activeVisitUuid = this.store.select(getActiveVisitUuid);
    this.visitService.submitClaim(activeVisitUuid).subscribe(response => {
      if (response.success) {
        console.log('E-claim submitted  successfully');
      } else {
        console.error('Failed to submit e-claim');
      }
    });
  }
}
