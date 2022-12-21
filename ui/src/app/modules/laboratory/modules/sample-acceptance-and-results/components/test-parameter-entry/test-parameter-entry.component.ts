import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGet } from "src/app/shared/resources/openmrs";
import { SampleAllocationObject } from "src/app/shared/resources/sample-allocations/models/allocation.model";

import { orderBy } from "lodash";

@Component({
  selector: "app-test-parameter-entry",
  templateUrl: "./test-parameter-entry.component.html",
  styleUrls: ["./test-parameter-entry.component.scss"],
})
export class TestParameterEntryComponent implements OnInit {
  @Input() parameterUuid: string;
  @Input() multipleResultsAttributeType: string;
  @Input() allocation: SampleAllocationObject;
  @Input() disabled: boolean;
  @Input() isLIS: boolean;
  @Input() conceptNameType: string;
  @Input() finalResult: any;
  testParameter$: Observable<ConceptGet>;
  @Output() data: EventEmitter<any> = new EventEmitter<any>();
  latestResult: any;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.testParameter$ = this.conceptService.getConceptDetailsByUuid(
      this.parameterUuid,
      "custom:(uuid,display,datatype,names,answers:(uuid,display,names),attributes:(uuid,display,attributeType:(uuid,display)))"
    );

    if (this.finalResult && !this.finalResult?.groups) {
      this.latestResult = {
        ...this.finalResult,
        value: this.finalResult?.valueNumeric
          ? this.finalResult?.valueNumeric
          : this.finalResult?.valueBoolean
          ? this.finalResult?.valueBoolean
          : this.finalResult?.valueComplex
          ? this.finalResult?.valueComplex
          : this.finalResult?.valueCoded
          ? this.finalResult?.valueCoded?.uuid
          : this.latestResult?.valueText
          ? this.latestResult?.valueText
          : this.latestResult?.valueModifier
          ? this.latestResult?.valueModifier
          : null,
      };
    } else {
      this.latestResult = {
        ...this.finalResult?.groups[this.finalResult?.groups?.length - 1]
          ?.results[0],
        value: this.finalResult?.groups[
          this.finalResult?.groups?.length - 1
        ]?.results?.map((result) => {
          return result?.valueNumeric
            ? result?.valueNumeric
            : result?.valueBoolean
            ? result?.valueBoolean
            : result?.valueComplex
            ? result?.valueComplex
            : result?.valueCoded
            ? result.valueCoded?.uuid
            : result?.valueText
            ? result?.valueText
            : result?.valueModifier
            ? result?.valueModifier
            : null;
        }),
      };
    }
  }

  onGetFormData(data: any, parameter: any): void {
    console.log("data:::::: ", data);
    this.data.emit({
      value: data,
      previousValue: this.latestResult?.value,
      multipleResults: data[0]?.value ? true : false,
      parameter: {
        ...parameter,
        isNumeric: parameter?.datatype?.name === "Numeric",
        isCoded: parameter?.datatype?.name === "Coded",
        isText: parameter?.datatype?.name === "Text",
        isFile: parameter?.datatype?.name == "Complex",
      },
    });
  }
}
