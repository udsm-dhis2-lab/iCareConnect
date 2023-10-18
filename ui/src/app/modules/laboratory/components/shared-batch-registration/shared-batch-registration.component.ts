import { Component, Input, OnInit } from "@angular/core";
import { MatRadioChange } from "@angular/material/radio";
import { CurrentUser } from "src/app/shared/models/current-user.models";

@Component({
  selector: "app-shared-batch-registration",
  templateUrl: "./shared-batch-registration.component.html",
  styleUrls: ["./shared-batch-registration.component.scss"],
})
export class SharedBatchRegistrationComponent implements OnInit {
  @Input() currentUser: CurrentUser;
  @Input() sampleRegistrationCategories: any;
  useExisitingBatchSet: boolean = false;
  useExistingBatch: boolean = false;
  registrationCategory: any;
  regCategoryItem: any;
  showBatchFieldsDefinition: boolean = true;
  constructor() {}

  ngOnInit(): void {
    console.log(JSON.stringify(this.sampleRegistrationCategories));
  }

  toggleExistingBatchOrBatchSet(event: any, category: string): void {
    if (category === "batchset") {
      this.useExisitingBatchSet = !this.useExisitingBatchSet;
    } else {
      this.useExistingBatch = !this.useExistingBatch;
    }
  }

  getRegistrationCategorySelection(event: MatRadioChange): void {
    this.registrationCategory = event?.value;

    this.showBatchFieldsDefinition = false;
    setTimeout(() => {
      this.showBatchFieldsDefinition = true;
    }, 20);
  }
}
