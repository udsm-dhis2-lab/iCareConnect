import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { SampleObject } from '../../resources/models';
import { Observable } from 'rxjs';
import {
  getAllLabSamples,
  getLabSamplesGroupedBymrNoAndFilteredByStatus,
} from '../../store/selectors/samples.selectors';
import {
  ConceptCreateFull,
  ProviderGet,
  UserGetFull,
} from 'src/app/shared/resources/openmrs';
import {
  getCurrentUserDetails,
  getProviderDetails,
} from 'src/app/store/selectors/current-user.selectors';
import { getSpecimenSources } from '../../store/selectors/specimen-sources-and-tests-management.selectors';

@Component({
  selector: 'app-collected-lab-samples',
  templateUrl: './collected-lab-samples.component.html',
  styleUrls: ['./collected-lab-samples.component.scss'],
})
export class CollectedLabSamplesComponent implements OnInit {
  selectedTab = new FormControl(0);

  expandedRow: number;

  collectedSamples$: Observable<SampleObject[]>;
  acceptedSamplesGroupedBymrNo$: Observable<any[]>;
  rejectedSamplesGroupedBymrNo$: Observable<any[]>;
  provider$: Observable<ProviderGet>;
  currentUser$: Observable<UserGetFull>;
  specimenSources$: Observable<ConceptCreateFull>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.specimenSources$ = this.store.select(getSpecimenSources, {
      name: 'Specimen sources',
    });
    this.collectedSamples$ = this.store.select(getAllLabSamples);
    this.acceptedSamplesGroupedBymrNo$ = this.store.select(
      getLabSamplesGroupedBymrNoAndFilteredByStatus,
      { status: 'ACCEPTED' }
    );

    this.rejectedSamplesGroupedBymrNo$ = this.store.select(
      getLabSamplesGroupedBymrNoAndFilteredByStatus,
      { status: 'REJECTED' }
    );
    this.provider$ = this.store.select(getProviderDetails);
    this.currentUser$ = this.store.select(getCurrentUserDetails);
  }

  changeTab(val): void {
    this.selectedTab.setValue(val);
  }

  onToggleExpand(rowNumber) {
    if (this.expandedRow === rowNumber) {
      this.expandedRow = undefined;
    } else {
      this.expandedRow = rowNumber;
    }
  }
}
