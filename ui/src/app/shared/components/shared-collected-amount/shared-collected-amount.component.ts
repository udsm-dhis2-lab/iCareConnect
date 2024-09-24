import { Component, OnInit } from "@angular/core";
import { GeneralBillingService } from "../../services/billing-info.service";
import { Observable } from "rxjs";
import { SoldItemsAmount } from "../../models/sold-items-amount.model";
import { MatRadioChange } from "@angular/material/radio";
import { MatCheckbox } from "@angular/material/checkbox";
import { formatDateToYYMMDD } from "../../helpers/format-date.helper";

@Component({
  selector: "app-shared-collected-amount",
  templateUrl: "./shared-collected-amount.component.html",
  styleUrl: "./shared-collected-amount.component.scss",
})
export class SharedCollectedAmountComponent implements OnInit {
  soldItemsByAmountDetails$: Observable<SoldItemsAmount[]>;
  userCategory: string = "me";
  parameters: string[] = [];
  constructor(private generalBillingService: GeneralBillingService) {}

  ngOnInit(): void {
    this.loadBillingData();
  }

  loadBillingData(): void {
    this.soldItemsByAmountDetails$ =
      this.generalBillingService.loadSoldItemsGeneratedAmount(this.parameters);
  }

  onToggleToday(event: MatCheckbox): void {
    console.log(event);
    this.parameters = [
      ...this.parameters,
      `startDate=${formatDateToYYMMDD(new Date())}`,
      `endDate=${formatDateToYYMMDD(new Date())}`,
    ];
    console.log(this.parameters);
    this.loadBillingData();
  }

  onSetUserToFilterData(event: MatRadioChange): void {
    console.log(event);
  }
}
