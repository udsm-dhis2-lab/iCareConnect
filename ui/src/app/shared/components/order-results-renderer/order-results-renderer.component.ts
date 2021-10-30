import { Component, Input, OnInit } from '@angular/core';
import { keyBy } from 'lodash';

@Component({
  selector: 'app-order-results-renderer',
  templateUrl: './order-results-renderer.component.html',
  styleUrls: ['./order-results-renderer.component.scss'],
})
export class OrderResultsRendererComponent implements OnInit {
  @Input() labOrdersResultsInformation: any[];
  @Input() testSetMembersDetails: any;
  @Input() codedResultsData: any;
  @Input() observationsKeyedByConcept: any;
  testSetMembersKeyedByConceptUuid: any = {};
  showParameters: boolean = false;
  currentLabTest: any;
  showOtherDetails: boolean = false;
  constructor() {}

  ngOnInit(): void {
    this.testSetMembersKeyedByConceptUuid = keyBy(
      this.testSetMembersDetails,
      'uuid'
    );
  }

  toggleParametes(event: Event): void {
    event.stopPropagation();
    this.showParameters = !this.showParameters;
  }

  setCurrentOrderedItemForOtherDetailsView(event: Event, labTest) {
    event.stopPropagation();
    this.currentLabTest = labTest;
    this.showOtherDetails = !this.showOtherDetails;
  }
}
