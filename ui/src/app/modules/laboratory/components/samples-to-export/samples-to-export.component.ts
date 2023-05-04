import { Component, Input, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { SamplesService } from "src/app/shared/services/samples.service";
import { orderBy } from "lodash";
import { formulateHeadersFromExportTemplateReferences } from "../../resources/helpers/import-export.helper";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { MatSelectChange } from "@angular/material/select";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

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
  category: string;
  hasStatus: string;
  searchingSpecimenSourceField: any;
  searchingTestField: any;
  searchingEquipmentsField: any;
  searchingText: string;

  testUuid: string;
  specimenUuid: string;
  instrumentUuid: string;
  dapartment: string;

  constructor(private sampleService: SamplesService) {}

  ngOnInit(): void {
    // console.log(this.exportTemplateDataReferences);
    this.formulatedHeaders = formulateHeadersFromExportTemplateReferences(
      this.exportTemplateDataReferences
    );

    this.searchingTestField = new Dropdown({
      id: "test",
      key: "test",
      label: "Search by Test",
      searchControlType: "concept",
      searchTerm: "TEST_ORDERS",
      conceptClass: "Test",
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.searchingSpecimenSourceField = new Dropdown({
      id: "specimen",
      key: "specimen",
      label: "Search by Specimen source",
      searchControlType: "concept",
      searchTerm: "SPECIMEN_SOURCE",
      conceptClass: "Specimen",
      shouldHaveLiveSearchForDropDownFields: true,
    });
    // TODO: Consider to put class name for instruments on global property
    this.searchingEquipmentsField = new Dropdown({
      id: "instrument",
      key: "instrument",
      label: "Search by Equipment",
      searchControlType: "concept",
      searchTerm: "LIS_INSTRUMENT",
      conceptClass: "LIS instrument",
      shouldHaveLiveSearchForDropDownFields: true,
    });
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

  onSelectDepartment(event: MatSelectChange): void {
    this.dapartment = event?.value?.uuid;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      dapartment: this.dapartment,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
    });
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

  onSearchByTest(formValue: FormValue): void {
    this.testUuid = formValue.getValues()?.test?.value;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
      dapartment: this.dapartment,
    });
  }

  onSearchBySpecimen(formValue: FormValue): void {
    this.specimenUuid = formValue.getValues()?.specimen?.value;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
      dapartment: this.dapartment,
    });
  }

  onSearchByEquipment(formValue: FormValue): void {
    this.instrumentUuid = formValue.getValues()?.instrument?.value;
    this.getSamples({
      instrument: this.instrumentUuid,
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      dapartment: this.dapartment,
    });
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
