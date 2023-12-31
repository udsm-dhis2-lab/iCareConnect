import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { SampleAllocation } from "src/app/shared/resources/sample-allocations/models/allocation.model";
import { formatDateToYYMMDD } from "src/app/shared/services/visits.service";

@Component({
  selector: "app-shared-tested-by-result-entry-fields",
  templateUrl: "./shared-tested-by-result-entry-fields.component.html",
  styleUrls: ["./shared-tested-by-result-entry-fields.component.scss"],
})
export class SharedTestedByResultEntryFieldsComponent implements OnInit {
  @Input() order!: any;
  @Input() isFormValid:boolean=false;
  testedByFormFields!: any;
  @Output() handleValidateForm: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() selectedTestedByFormFields: EventEmitter<any> =
    new EventEmitter<any>();


  testedBy!: any;
  testedDate!: any;
  isShowInvalidDate:boolean = false;

  constructor() {}

  ngOnInit(): void {
  
    this.order?.allocations?.forEach((allocation) => {
      const formattedAllocation: any = new SampleAllocation(
        allocation
      ).toJson();
      if (formattedAllocation?.finalResult?.testedBy) {
        this.testedBy = !this.testedBy
          ? formattedAllocation?.finalResult?.testedBy
          : this.testedBy;
        this.testedDate = !this.testedDate
          ? formatDateToYYMMDD(
              new Date(formattedAllocation?.finalResult?.testedDate)
            )
          : this.testedDate;

        this.createTestedByDetailsField();
      } else if (formattedAllocation?.finalResult?.groups) {
        const results: any[] =
          formattedAllocation?.finalResult?.groups[
            formattedAllocation?.finalResult?.groups?.length - 1
          ]?.results;
        const currentResult = results[results?.length - 1];
        this.testedBy = !this.testedBy
          ? currentResult?.testedBy
          : this.testedBy;
        this.testedDate = !this.testedDate
          ? formatDateToYYMMDD(new Date(currentResult?.testedDate))
          : this.testedDate;
        this.createTestedByDetailsField();
      } else {
        this.createTestedByDetailsField();
      }
    });
  }

  createTestedByDetailsField(): void {
    this.testedByFormFields = [
      new Dropdown({
        id: "testedBy",
        key: "testedBy",
        label: "Tested By",
        options: [],
        value: this.testedBy?.uuid,
        searchControlType: "user",
        shouldHaveLiveSearchForDropDownFields: true,
      }),
      new DateField({
        id: "date",
        key: "date",
        value: this.testedDate,
        label: "Date tested",
      }),
    ];
  }

  onFormUpdate(formValue: FormValue): void {
    // collected date is on this.order.dateCreated
    const collectedDate = new Date(this.order.dateCreated);
    const reportingDate = Date.now();
    const enteredDate = formValue.getValues()?.date?.value ? new Date(formValue.getValues().date.value) : null;
  
    const validateEnteredDate = ()=> {
      if (!enteredDate || isNaN(enteredDate.getTime())) {
        // If enteredDate is invalid or null
        this.isFormValid = false;
        this.handleValidateForm.emit(false);
        this.isShowInvalidDate=true;
        

      } else {
        if (enteredDate >= collectedDate && enteredDate.getTime() <= reportingDate) {
          // If enteredDate is within the range
          this.isFormValid = true;
          this.handleValidateForm.emit(true);
          this.isShowInvalidDate =false;
        } else {
          // If enteredDate is outside the range
          this.isFormValid = false;
          this.handleValidateForm.emit(false);
          this.isShowInvalidDate=true;
        }
      }
    }
    
    validateEnteredDate(); // Call the function to perform validation
  

   
    this.selectedTestedByFormFields.emit({
      date: formValue.getValues()?.date?.value
        ? formatDateToYYMMDD(new Date(formValue.getValues()?.date?.value))
        : null,
      testedBy: formValue.getValues()?.testedBy?.value
        ? formValue.getValues()?.testedBy?.value
        : null,
    });
  }
}
