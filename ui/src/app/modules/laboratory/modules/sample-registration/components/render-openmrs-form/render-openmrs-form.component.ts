import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormById } from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-render-openmrs-form",
  templateUrl: "./render-openmrs-form.component.html",
  styleUrls: ["./render-openmrs-form.component.scss"],
})
export class RenderOpenmrsFormComponent implements OnInit {
  @Input() formId: string;
  customForm$: Observable<any>;
  @Output() formUpdate: EventEmitter<any> = new EventEmitter<any>();
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.customForm$ = this.store.select(getCustomOpenMRSFormById(this.formId));
  }

  onFormUpdate(data: any): void {
    this.formUpdate.emit(data);
  }
}
