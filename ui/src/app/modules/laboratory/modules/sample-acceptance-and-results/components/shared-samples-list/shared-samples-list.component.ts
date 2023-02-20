import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { omit } from "lodash";
import { Observable } from "rxjs";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-shared-samples-list",
  templateUrl: "./shared-samples-list.component.html",
  styleUrls: ["./shared-samples-list.component.scss"],
})
export class SharedSamplesListComponent implements OnInit {
  @Input() LISConfigurations: any;
  @Input() labSamplesDepartments: any;
  @Input() tabType: string;
  @Input() datesParameters: any;
  @Input() excludeAllocations: boolean;
  @Input() sampleTypes: any[];
  @Input() codedSampleRejectionReasons: any[];
  @Input() category: string;
  @Input() hasStatus: string;
  @Input() acceptedBy: string;
  samplesToViewMoreDetails: any = {};
  selectedDepartment: string;
  searchingText: string;
  page: number = 1;
  pageSize: number = 10;
  @Output() resultEntrySample: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedSampleDetails: EventEmitter<any> = new EventEmitter<any>();
  selectedSamples: any[] = [];
  @Output() samplesForAction: EventEmitter<any[]> = new EventEmitter<any[]>();

  samples$: Observable<{ pager: any; results: any[] }>;

  pageCounts: any[] = [1, 5, 10, 20, 25, 50, 100, 200];
  constructor(private sampleService: SamplesService) {}

  ngOnInit(): void {
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: this.page,
    });
  }

  getSamples(params?: any): void {
    this.samples$ = this.sampleService.getLabSamplesByCollectionDates(
      this.datesParameters,
      params?.category,
      params?.hasStatus,
      this.excludeAllocations,
      {
        pageSize: params?.pageSize,
        page: params?.page,
      },
      {
        departments: this.labSamplesDepartments,
        specimenSources: this.sampleTypes,
        codedRejectionReasons: this.codedSampleRejectionReasons,
      },
      this.acceptedBy,
      params?.q
    );
  }

  onPageChange(event: any): void {
    this.page = this.page + (event?.pageIndex - event?.previousPageIndex);
    this.pageSize = event?.pageSize;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: this.page,
    });
  }

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    if (!this.samplesToViewMoreDetails[sample?.uuid]) {
      this.samplesToViewMoreDetails[sample?.uuid] = sample;
    } else {
      this.samplesToViewMoreDetails = omit(
        this.samplesToViewMoreDetails,
        sample?.uuid
      );
    }
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

  onSelectItem(event: MatCheckboxChange, sample: any): void {
    this.selectedSamples = event?.checked
      ? [...this.selectedSamples, sample]
      : this.selectedSamples?.filter(
          (selectedSample) => selectedSample?.label !== sample?.label
        ) || [];
    this.samplesForAction.emit(this.selectedSamples);
  }

  onSearchSamples(event): void {
    this.searchingText = (event.target as HTMLInputElement)?.value;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
    });
  }
}
