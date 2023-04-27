import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { WorkSheetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-result-entry-by-batch-home",
  templateUrl: "./result-entry-by-batch-home.component.html",
  styleUrls: ["./result-entry-by-batch-home.component.scss"],
})
export class ResultEntryByBatchHomeComponent implements OnInit {
  @Input() isLIS: boolean;
  @Input() datesParameters: any;
  @Input() viewType: string;
  worksheetDefinitions$: Observable<any[]>;
  multipleResultsAttributeType$: Observable<any>;
  currentWorksheetDefinitionUuid: string;
  conceptNameType: string;
  errors: any[] = [];
  batchsets$: Observable<any>;
  batches$: Observable<any>;
  batchsetsField: any;
  batchesField: any;
  formData: any;
  batches: any;
  batchsets: any;
  filteringBatches: boolean = false;
  constructor(
    private worksheetsService: WorkSheetsService,
    private systemSettingsService: SystemSettingsService,
    private samplesService: SamplesService
  ) {}

  ngOnInit(): void {
    this.conceptNameType = this.isLIS ? "SHORT" : "FULLY_SPECIFIED";
    this.worksheetDefinitions$ = this.worksheetsService.getWorksheetDefinitions(
      this.datesParameters
    );
    this.batchesField =  new Dropdown({
      id: "batch",
      key: "batch",
      label: "Select batch",
      shouldHaveLiveSearchForDropDownFields: false,
    })
    this.batchsetsField = new Dropdown({
      id: "batchset",
      key: "batchset",
      label: "Select batch set",
      shouldHaveLiveSearchForDropDownFields: false,
    })

    this.batchsets$ = this.samplesService.getBatchsets().pipe(
      map((response) => {
        if (!response?.error) {
          this.batchsets = response;
          this.batchsetsField.options = [
            {
              key: "",
              label: "",
              value: null,
              name: "",
            },
            ...response?.map((batchset) => {
              return {
                key: batchset?.uuid,
                label: batchset?.name,
                value: batchset?.uuid,
                name: batchset?.name,
              }
            })
          ]
          return response;
        }
      })
    );
    this.batches$ = this.samplesService.getBatches().pipe(
      map((response) => {
        if (!response?.error) {
          this.batches = response?.map((batch) => {
            return {
              key: batch?.uuid,
              label: batch?.name,
              value: batch?.uuid,
              name: batch?.name,
            }
          });
          this.batchesField.options = this.batches;
          return response;
        }
      })
    );

    this.multipleResultsAttributeType$ = this.systemSettingsService
      .getSystemSettingsByKey(
        `iCare.laboratory.settings.testParameters.attributes.multipleResultsAttributeTypeUuid`
      )
      .pipe(
        map((response) => {
          if (response && !response?.error) {
            return response;
          } else {
            this.errors = [...this.errors, response];
            return response;
          }
        })
      );
  }

  onFormUpdate(formValues: FormValue, key?: string){
    this.formData = formValues.getValues();
    if(key === 'batchset'){
      this.filteringBatches = true
      setTimeout(() => {
        this.batchesField.options = this.batchsets?.filter((batchset) => batchset?.uuid === this.formData['batchset']?.value)[0]?.batches?.map((batch) => {
          return {
            key: batch?.uuid,
            label: batch?.name,
            value: batch?.uuid,
            name: batch?.name,
          }
        }) || this.batches;
        this.filteringBatches = false
      }, 100)
    }
  }
}
