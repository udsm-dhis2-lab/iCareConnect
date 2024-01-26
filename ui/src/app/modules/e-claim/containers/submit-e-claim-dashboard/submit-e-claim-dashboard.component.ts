import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import { go } from 'src/app/store/actions';
import { AppState } from 'src/app/store/reducers';
import {Inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-submit-e-claim-dashboard',
  templateUrl: './submit-e-claim-dashboard.component.html',
  styleUrls: ['./submit-e-claim-dashboard.component.scss'],
})
export class SubmitEClaimDashboardComponent implements OnInit {
  @Input() visitUuid: string;
  claimSent: boolean = false;
  submittingClaim: boolean = false;
  visitClaim$: Observable<any>;
  submitClaimResponse$: Observable<any>;
  htmlStr: string;

  constructor(
    private visitService: VisitsService,
    private store: Store<AppState>,
    @Inject(ActivatedRoute) private params: ActivatedRoute 

  ) {
    this.htmlStr = params?.snapshot?.data?.visitClaim?.claimFile;
  }

  ngOnInit(): void {
    this.visitClaim$ = this.visitService.getVisitClaim(this.visitUuid);
  }

  onSubmitEClaim(event: Event, visitUuid): void {
    event.stopPropagation();
    this.claimSent = false;
    this.submittingClaim = true;
    this.submitClaimResponse$ = this.visitService.submitClaim(visitUuid);
    this.submitClaimResponse$.subscribe((response) => {
      if (response) {
        setTimeout(() => {
          this.claimSent = true;
          this.submittingClaim = false;
        }, 300);
      }
    });
  }
}
