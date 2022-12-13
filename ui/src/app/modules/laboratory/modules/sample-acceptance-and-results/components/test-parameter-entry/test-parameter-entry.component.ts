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
  testParameter$: Observable<ConceptGet>;
  @Output() data: EventEmitter<any> = new EventEmitter<any>();
  latestResult: any;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.testParameter$ = this.conceptService.getConceptDetailsByUuid(
      this.parameterUuid,
      "custom:(uuid,display,datatype,answers,attributes:(uuid,display,attributeType:(uuid,display)))"
    );
    this.latestResult =
      this.allocation?.results?.length > 0
        ? orderBy(this.allocation?.results, ["dateCreated"], ["desc"])[0]
        : null;

    if (this.latestResult) {
      this.latestResult = {
        ...this.latestResult,
        value: this.latestResult?.valueNumeric
          ? this.latestResult?.valueNumeric
          : this.latestResult?.valueBoolean
          ? this.latestResult?.valueBoolean
          : this.latestResult?.valueComplex
          ? this.latestResult?.valueComplex
          : this.latestResult?.valueCoded
          ? this.latestResult?.valueCoded?.uuid
          : this.latestResult?.valueText
          ? this.latestResult?.valueText
          : this.latestResult?.valueModifier
          ? this.latestResult?.valueModifier
          : null,
      };
    }
  }

  onGetFormData(data: any, parameter: any): void {
    this.data.emit({
      value: !data?.uuid ? data : data?.uuid,
      previousValue: this.latestResult?.value,
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
