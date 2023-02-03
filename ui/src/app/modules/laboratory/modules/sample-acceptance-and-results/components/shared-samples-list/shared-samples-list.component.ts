import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-shared-samples-list",
  templateUrl: "./shared-samples-list.component.html",
  styleUrls: ["./shared-samples-list.component.scss"],
})
export class SharedSamplesListComponent implements OnInit {
  @Input() samples: any[];
  @Input() LISConfigurations: any;
  @Input() labSamplesDepartments: any;
  @Input() tabType: string;
  searchingText: string;
  samplesToViewMoreDetails: any = {};
  selectedDepartment: string;

  page: number = 1;
  pageCount: number = 100;
  @Output() resultEntrySample: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedSampleDetails: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    console.log(sample);
  }

  setDepartment(event: Event, departmentName): void {
    event.stopPropagation();
    this.selectedDepartment = departmentName;
  }

  onResultsEntryAndReview(e: Event, sample: any): void {
    e.stopPropagation();
    this.resultEntrySample.emit(sample);
  }

  onPrint(event: Event, sample: any): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit(sample);
  }

  onAccept(event: Event, sample: any, actionType?: string): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit({ ...sample, actionType });
  }
  onReject(event: Event, sample: any, actionType?: string): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit({ ...sample, actionType });
  }
}
