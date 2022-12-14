import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { flatten } from "lodash";
import { Observable, zip } from "rxjs";
import { map } from "rxjs/operators";
import { StockService } from "src/app/shared/resources/store/services/stock.service";

@Component({
  selector: "app-confirm-requisitions-modal",
  templateUrl: "./confirm-requisitions-modal.component.html",
  styleUrls: ["./confirm-requisitions-modal.component.scss"],
})
export class ConfirmRequisitionsModalComponent implements OnInit {
  dialogData: any;
  stockStatusDifferentItemsOnRequestedStore$: Observable<any>;
  constructor(
    private dialogRef: MatDialogRef<ConfirmRequisitionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private stockService: StockService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    let requisitionItems = [];
    Object.keys(this.dialogData).forEach((key) => {
      requisitionItems = [...requisitionItems, ...this.dialogData[key]];
    });

    this.stockStatusDifferentItemsOnRequestedStore$ = zip(
      ...requisitionItems.map((item) => {
        return this.stockService.getAvailableStockOfAnItem(
          item?.itemUuid,
          item?.requestedLocation?.uuid
        );
      })
    ).pipe(map((response) => flatten(response)));
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onConfirm(event: Event, stockStatusDifferentItemsOnRequestedStore): void {
    event.stopPropagation();
    this.dialogRef.close({
      requisitions: this.dialogData,
      stockStatus: stockStatusDifferentItemsOnRequestedStore,
    });
  }
}
