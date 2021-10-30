import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { connect } from 'http2';
import { Observable } from 'rxjs';
import { IssuingObject } from 'src/app/shared/resources/store/models/issuing.model';
import {
  issueRequest,
  loadIssuings,
  rejectRequisition,
} from 'src/app/store/actions/issuing.actions';
import { AppState } from 'src/app/store/reducers';
import {
  getAllIssuings,
  getIssuingLoadingState,
} from 'src/app/store/selectors/issuing.selectors';
import { IssuingFormComponent } from '../../modals/issuing-form/issuing-form.component';
import { RequestCancelComponent } from '../../modals/request-cancel/request-cancel.component';

@Component({
  selector: 'app-issuing',
  templateUrl: './issuing.component.html',
  styleUrls: ['./issuing.component.scss'],
})
export class IssuingComponent implements OnInit {
  issuingList$: Observable<IssuingObject[]>;
  loadingIssuingList$: Observable<boolean>;
  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit() {
    this.issuingList$ = this.store.pipe(select(getAllIssuings));
    this.loadingIssuingList$ = this.store.pipe(select(getIssuingLoadingState));
  }

  onIssue(e: Event, issue: IssuingObject): void {
    e.stopPropagation();

    const dialog = this.dialog.open(IssuingFormComponent, {
      width: '25%',
      panelClass: 'custom-dialog-container',
      data: { issue },
    });

    dialog.afterClosed().subscribe((result) => {
      if (result?.issueInput) {
        this.store.dispatch(
          issueRequest({ id: issue.id, issueInput: result.issueInput })
        );
      }
    });
  }

  onReject(e: Event, issue: IssuingObject): void {
    e.stopPropagation();

    const dialogToConfirmRejection = this.dialog.open(RequestCancelComponent, {
      width: '25%',
      panelClass: 'custom-dialog-container',
      data: 'issue',
    });

    dialogToConfirmRejection.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(
          rejectRequisition({ id: issue.id, reason: result?.reason })
        );
      }
    });
  }
}
