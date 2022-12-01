import { Component, Input, OnInit } from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
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
  page: number;
  pageSize: number;
  errors: any[] = [];
  pageCounts: any[] = [5, 10, 20, 25, 50, 100];
  constructor(private samplesService: SamplesService) {}

  ngOnInit(): void {
    this.page = 1;
    this.pageSize = 10;
    this.getList();
  }

  getList(): void {
    this.samples$ = this.samplesService
      .getSamplesByPaginationDetails(
        { page: this.page, pageSize: this.pageSize },
        null,
        this.departments,
        this.specimenSources,
        this.codedSampleRejectionReasons
      )
      .pipe(
        tap((response: any) => {
          if (response?.error || response.stackTrace) {
            this.errors =
              response?.error && !response?.stackTrace
                ? [...this.errors, response?.error]
                : response?.stackTrace
                ? [
                    ...this.errors,
                    {
                      error: {
                        message: response?.message,
                      },
                    },
                  ]
                : [
                    ...this.errors,
                    {
                      error: {
                        message: "Unknown error occurred!",
                      },
                    },
                  ];
          }
        })
      );
  }

  onGetSamples(event: Event, action: string, pager: any): void {
    event.stopPropagation();
    this.page = action === "prev" ? this.page - 1 : this.page + 1;
    this.getList();
  }

  onPageChange(event){
    this.page = event.pageIndex + 1;
    this.pageSize  = Number(event?.pageSize)
    this.getList();
  }
}
