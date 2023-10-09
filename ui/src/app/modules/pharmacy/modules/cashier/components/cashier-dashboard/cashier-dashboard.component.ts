import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { loadCustomOpenMRSForm } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormById } from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-cashier-dashboard",
  templateUrl: "./cashier-dashboard.component.html",
  styleUrls: ["./cashier-dashboard.component.scss"],
})
export class CashierDashboardComponent implements OnInit {
  @Input() formId: string;
  @Input() currentUser: any;
  @Input() currentLocation: any;
  customForm$: Observable<any>;
  searchItemFormField: any;
  selectedItems: any[] = [];
  formData: any;
  saving: boolean = false;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // console.log(this.currentUser);
    // console.log("form", this.formId);
    this.store.dispatch(loadCustomOpenMRSForm({ formUuid: this.formId }));
    this.customForm$ = this.store.select(getCustomOpenMRSFormById(this.formId));
    this.createSearchItemFormField();
  }

  createSearchItemFormField(): void {
    this.searchItemFormField = new Dropdown({
      id: "item",
      key: "item",
      required: true,
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
      searchControlType: "drugStock",
      locationUuid: this.currentLocation?.uuid,
    });
  }

  onFormUpdate(data: any): void {
    // console.log("DATA", data);
  }

  onSearchItemFormUpdate(formValues: FormValue): void {
    this.formData = formValues.getValues()?.item?.value;
  }

  onAddToList(event: Event, item: any): void {
    event.stopPropagation();
    this.selectedItems = [...this.selectedItems, item];
    this.createSearchItemFormField();
    this.formData = null;
  }

  onRemove(event: Event, itemToRemove: any): void {
    event.stopPropagation();
    this.selectedItems = this.selectedItems?.filter(
      (item: any) => item?.name != itemToRemove?.name
    );
  }

  onSave(event, items): void {
    event.stopPropagation();
    console.log(items);
    this.saving = true;
    setTimeout(() => {
      this.selectedItems = [];
      this.createSearchItemFormField();
      this.saving = false;
    }, 2000);
  }
}
