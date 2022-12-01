import { Component, Input, OnInit } from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
import { Observable } from "rxjs";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-samples-list",
  templateUrl: "./samples-list.component.html",
  styleUrls: ["./samples-list.component.scss"],
})
export class SamplesListComponent implements OnInit {
  @Input() departments: any[];
  @Input() specimenSources: any[];
  @Input() codedSampleRejectionReasons: any[];
  samples$: Observable<any>;
  page: number = 1;
  pageSize: number = 10;
  pageCounts: any[] = [5, 10, 20, 25, 50, 100];
  constructor(private samplesService: SamplesService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.samples$ = this.samplesService.getSamplesByPaginationDetails(
      { page: this.page, pageSize: this.pageSize },
      null,
      this.departments,
      this.specimenSources,
      this.codedSampleRejectionReasons
    );
  }

  onGetSamples(event: Event, action: string, pager: any): void {
    event.stopPropagation();
    this.page = action === "prev" ? this.page - 1 : this.page + 1;
    this.getList();
  }

  getSelectedPageItemsCount(event: Event): void {
    event.stopPropagation();
    console.log(event);
    this.pageSize = Number((event?.target as HTMLInputElement)?.value);
    this.getList();
  }
}
