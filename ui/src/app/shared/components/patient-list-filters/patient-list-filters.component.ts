import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, zip } from "rxjs";
import { map } from "rxjs/operators";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";
import { keyBy } from "lodash";

@Component({
  selector: "app-patient-list-filters",
  templateUrl: "./patient-list-filters.component.html",
  styleUrls: ["./patient-list-filters.component.scss"],
})
export class PatientListFiltersComponent implements OnInit {
  @Input() filterCategories: any[];
  filterCategoriesOptions$: Observable<any>;
  filterParameters: any;

  @Output() onFilterChanged = new EventEmitter<any>();

  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.filterCategoriesOptions$ = zip(
      ...this.filterCategories.map((category) =>
        this.conceptService.getConceptDetailsByUuid(
          category?.value,
          "custom:(uuid,display,setMembers:(uuid,display))"
        )
      )
    ).pipe(
      map((response) => {
        return keyBy(response, "uuid");
      })
    );
  }

  getValue(event: any){
    // this.onFilterChanged.emit(this.paymentTypeSelected);
    
    this.filterParameters += event.value.value ? event.value.value : "";  
    
    console.log(event.value);
  }

}
