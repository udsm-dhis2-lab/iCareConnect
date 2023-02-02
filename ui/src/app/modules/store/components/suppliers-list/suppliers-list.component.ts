import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { from, interval, Observable, of } from "rxjs";
import { debounceTime, map, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { LedgerInput } from "src/app/shared/resources/store/models/ledger-input.model";
import { StockObject } from "src/app/shared/resources/store/models/stock.model";
import { StockService } from "src/app/shared/resources/store/services/stock.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
import { AddNewStockReceivedComponent } from "../../modals/add-new-stock-received/add-new-stock-received.component";
import { SupplierFormComponent } from "../supplier-form/supplier-form.component";

@Component({
  selector: "app-suppliers-list",
  templateUrl: "./suppliers-list.component.html",
  styleUrls: ["./suppliers-list.component.scss"],
})
export class SuppliersListComponent implements OnInit {
  suppliers$: Observable<any>;
  errors: any[] = [];
  loadingSuppliers: boolean = false;
  constructor(
    public dialog: MatDialog,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadingSuppliers = true
    this.suppliers$ = this.supplierService.getSuppliers().pipe(
      map((response) => {
        this.loadingSuppliers = false;
        if (!response?.error) {
          return response;
        }
        if (response?.error) {
          this.errors = [...this.errors, response.error];
        }
      })
    );
  }

  onAddNewSupplier(e: any) {
    e?.stopPropagation();
    this.dialog.open(SupplierFormComponent, {
      width: "40%",
      panelClass: "custom-dialog-container",
    }).afterClosed().subscribe((response) => {
      this.ngOnInit()
    });
  }
}
