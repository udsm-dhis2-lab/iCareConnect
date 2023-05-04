import { Component, Input, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { SamplesService } from "src/app/shared/services/samples.service";
import { orderBy } from "lodash";
import { formulateHeadersFromExportTemplateReferences } from "../../resources/helpers/import-export.helper";

@Component({
  selector: "app-samples-to-export",
  templateUrl: "./samples-to-export.component.html",
  styleUrls: ["./samples-to-export.component.scss"],
})
export class SamplesToExportComponent implements OnInit {
  @Input() exportTemplateDataReferences: any[];
  @Input() labSamplesDepartments: any[];
  @Input() sampleTypes: any[];
  @Input() codedSampleRejectionReasons: any[];
  startDate: Date;
  endDate: Date;
  datesParameters: any;
  acceptedBy: any;
  samples$: Observable<any>;
  excludeAllocations: boolean = false;
  pageSize: number = 10;
  page: number = 1;
  formulatedHeaders: any = {};
  constructor(private sampleService: SamplesService) {}

  ngOnInit(): void {
    console.log(this.exportTemplateDataReferences);
    this.formulatedHeaders = formulateHeadersFromExportTemplateReferences(
      this.exportTemplateDataReferences
    );
  }

  onDateChange(dateChanged?: boolean) {
    this.datesParameters = {
      startDate: `${this.startDate.getFullYear()}-${
        this.startDate.getMonth() + 1
      }-${this.startDate.getDate()}`,
      endDate: `${this.endDate.getFullYear()}-${
        this.endDate.getMonth() + 1
      }-${this.endDate.getDate()}`,
    };
    if (dateChanged) {
      this.getSamples({ pageSize: this.pageSize, page: this.page });
    }
  }

  getSamples(params?: any): void {
    this.samples$ = of(null);
    setTimeout(() => {
      this.samples$ = this.sampleService
        .getLabSamplesByCollectionDates(
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
          params?.q,
          params?.dapartment,
          params?.testUuid,
          params?.instrument,
          params?.specimenUuid
        )
        .pipe(
          map((response: { pager: any; results: any[] }) => {
            return {
              pager: response?.pager,
              results: response?.results?.map((result: any) => {
                let formattedResult = { ...result };
                orderBy(
                  this.exportTemplateDataReferences,
                  ["order"],
                  ["asc"]
                )?.forEach((reference: any) => {
                  if (reference?.systemKey) {
                    if (reference?.category === "patient") {
                      formattedResult[reference?.systemKey] =
                        reference?.options?.length > 0
                          ? (reference?.options?.filter(
                              (option) =>
                                option?.code ===
                                result?.patient[reference?.systemKey]
                            ) || [])[0]
                            ? (reference?.options?.filter(
                                (option) =>
                                  option?.code ===
                                  result?.patient[reference?.systemKey]
                              ) || [])[0]?.exportValue
                            : "N/A"
                          : result?.patient[reference?.systemKey];
                    }
                  }
                });
                return formattedResult;
              }),
            };
          })
        );
    }, 50);
  }
}
