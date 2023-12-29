import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import { go } from 'src/app/store/actions';
import { AppState } from 'src/app/store/reducers';
import { of } from 'rxjs';

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
  constructor(
    private visitService: VisitsService,
    private store: Store<AppState>
  ) {}


  // Lifecycle hook: Called after Angular has initialized all data-bound properties of a directive
  ngOnInit(): void {
    // Fetches visit claim data based on the provided visit UUID
    this.visitService.getVisitClaim(this.visitUuid)
      .subscribe(
        // Success callback
        (claimData) => {
          // Initializes visitClaim$ observable with the fetched data
          this.visitClaim$ = of(claimData);
        },
        // Error callback
        (error) => {
          console.error('Error fetching visit claim:', error);
          // Handle the error, update UI, show user-friendly message, etc.
        }
      );
  }

  // Method triggered when the user submits an e-claim
  onSubmitEClaim(event: Event, visitUuid: string): void {
    // Prevents the event from propagating further up the DOM hierarchy
    event.stopPropagation();

    // Initializes flags to manage the UI state during the claim submission process
    this.claimSent = false;
    this.submittingClaim = true;

    // Initiates the API call to submit the e-claim
    this.submitClaimResponse$ = this.visitService.submitClaim(visitUuid);

    // Subscribes to the response from the API call
    this.submitClaimResponse$.subscribe(
      // Success callback
      (response) => {
        // Checks if the response is truthy (successful submission)
        if (response) {
          // Introduces a delay of 300 milliseconds before updating the UI state
          // This may be used for visual effects or transitions
          setTimeout(() => {
            this.handleSuccessfulSubmission();
          }, 300);
        }
      },
      // Error callback
      (error) => {
        // Logs the error to the console for debugging purposes
        console.error('Error submitting claim:', error);
        // Calls a method to handle errors and update the UI accordingly
        this.handleSubmissionError();
      }
    );
  }

  // Private method to handle UI updates after a successful claim submission
  private handleSuccessfulSubmission(): void {
    // Updates flags to reflect a successful claim submission
    this.claimSent = true;
    this.submittingClaim = false;
  }

  // Private method to handle UI updates and error handling after a submission error
  private handleSubmissionError(): void {
    // Handles the error, updates UI, or shows user-friendly messages, etc.
    this.claimSent = false;
    this.submittingClaim = false;
  }
}
