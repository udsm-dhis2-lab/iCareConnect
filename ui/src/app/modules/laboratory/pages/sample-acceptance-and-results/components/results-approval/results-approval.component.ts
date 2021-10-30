import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import { EncountersService } from 'src/app/shared/services/encounters.service';
import { getPatientsCollectedSamples } from 'src/app/shared/helpers/patient.helper';

@Component({
  selector: 'app-results-approval',
  templateUrl: './results-approval.component.html',
  styleUrls: ['./results-approval.component.scss'],
})
export class ResultsApprovalComponent implements OnInit {
  @Input() visits: any;
  @Input() sampleTypes: any;
  @Input() labOrdersBillingInfo: any;
  samples: any[];
  searchingText: string = '';
  currentSample: any;
  ready: boolean = false;
  values: any = {};
  savedData: any = {};
  savingMessage: any = {};
  selected = new FormControl(0);
  samplesWithCompleteFirstSignOff: any;
  samplesWithCompleteSecondSignOff: any;
  samplesWithRejectedResults: any;

  constructor(private encounterService: EncountersService) {}

  ngOnInit(): void {
    this.samples = _.filter(
      getPatientsCollectedSamples(
        this.visits,
        this.sampleTypes,
        this.labOrdersBillingInfo
      ),
      { allHaveResults: true }
    );

    this.samplesWithCompleteFirstSignOff = _.filter(
      getPatientsCollectedSamples(
        this.visits,
        this.sampleTypes,
        this.labOrdersBillingInfo
      ),
      { firstSignOff: true }
    );

    this.samplesWithCompleteSecondSignOff = _.filter(
      getPatientsCollectedSamples(
        this.visits,
        this.sampleTypes,
        this.labOrdersBillingInfo
      ),
      { secondSignOff: true }
    );
    this.samplesWithRejectedResults = _.filter(
      getPatientsCollectedSamples(
        this.visits,
        this.sampleTypes,
        this.labOrdersBillingInfo
      ),
      { rejectedResults: true }
    );

    this.currentSample = this.samples[0];
    // set values
    _.each(this.currentSample.items, (item) => {
      if (item.result) {
        this.values[this.currentSample.identifier + '-' + item.display] =
          item.result;
        this.savedData[this.currentSample.identifier + '-' + item.display] =
          item.result;
      }
    });
    setTimeout(() => {
      this.ready = true;
    }, 1000);
    // console.log('value', this.values);
    // console.log(this.savedData);
  }

  setPanel(sample) {
    this.currentSample = sample;
    _.each(this.currentSample.items, (item) => {
      if (item.result) {
        this.values[this.currentSample.identifier + '-' + item.display] =
          item.result;
        this.savedData[this.currentSample.identifier + '-' + item.display] =
          item.result;
      }
    });
  }
  changeTab(val) {
    this.selected.setValue(val);
  }
}
