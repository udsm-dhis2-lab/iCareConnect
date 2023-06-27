import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { LedgerInput } from "src/app/shared/resources/store/models/ledger-input.model";
import { StockObject } from "src/app/shared/resources/store/models/stock.model";
import { StockService } from "src/app/shared/resources/store/services/stock.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
import { AddNewStockReceivedComponent } from "../../modals/add-new-stock-received/add-new-stock-received.component";
import { ConsumeStockItemModalComponent } from "../../modals/consume-stock-item-modal/consume-stock-item-modal.component";

@Component({
  selector: "app-stock-status-list",
  templateUrl: "./stock-status-list.component.html",
  styleUrls: ["./stock-status-list.component.scss"],
})
export class StockStatusListComponent implements OnInit {
  @Input() currentLocation: LocationGet;
  @Input() ledgerTypes: any[];
  @Input() userPrivileges: any;
  @Input() isCurrentLocationMainStore: boolean;
  @Input() isStockOutPage: boolean;
  @Input() status: string;
  stocksList$: Observable<StockObject[]>;
  searchTerm: string;
  currentItemStock: StockObject;
  currentItemStocks$: Observable<StockObject>;
  currentItemStock$: Observable<StockObject>;
  saving: boolean = false;
  itemID?: string;
  showReceivingForm?: boolean;
  errors: any[] = [];
  suppliers$: Observable<any>;
  unitsOfMeasurementSettings$: Observable<any>;
  unitsOfMeasurement$: Observable<any>;
  pageSize: number = 10;
  page: number = 1;
  pager: number;
  pageSizeOptions: number[] = [5, 10, 15, 25, 50];
  consumeLedgerUuid$: Observable<string>;
  constructor(
    private stockService: StockService,
    private dialog: MatDialog,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.consumeLedgerUuid$ = this.systemSettingsService.getSystemSettingsByKey(
      `icare.store.settings.consumeLedger.ledgerTypeUuid`
    );
    this.consumeLedgerUuid$.subscribe((response: any) => {
      if (response?.error) {
        this.errors = [...this.errors, response];
      } else if (response === "none") {
        this.errors = [
          ...this.errors,
          {
            error: {
              error:
                "icare.store.settings.consumeLedger.ledgerTypeUuid does not exist, contact IT",
              message:
                "icare.store.settings.consumeLedger.ledgerTypeUuid does not exist, contact IT",
            },
          },
        ];
      }
    });
    this.getStock();
  }

  searchStock(event: any): void {
    this.searchTerm = event.target?.value;
    setTimeout(() => {
      this.getStock();
    }, 200);
  }

  onAddNewStockRecevied(
    event: Event,
    ledgerTypes: any[],
    currentStore: LocationGet
  ): void {
    event.stopPropagation();
    this.dialog
      .open(AddNewStockReceivedComponent, {
        width: "700px",
        data: {
          ledgerTypes,
          currentStore,
        },
      })
      .afterClosed()
      .subscribe((shouldReloadStock) => {
        if (shouldReloadStock) {
        }
      });
  }

  getStock(): void {
    if (!this.isStockOutPage && !this.status) {
      this.stocksList$ = this.stockService
        .getAvailableStocks(
          this.currentLocation?.uuid,
          { q: this.searchTerm },
          this.page,
          this.pageSize
        )
        .pipe(
          map((response) => {
            this.pager = response?.pager;
            return response?.results;
          })
        );
    } else if (this.isStockOutPage) {
      this.stocksList$ = this.stockService
        .getStockOuts(this.currentLocation?.uuid, this.page, this.pageSize)
        .pipe(
          map((response) => {
            this.pager = response?.pager;
            return response?.results;
          })
        );
    } else if (this.status === "EXPIRED") {
      this.stocksList$ = this.stockService
        .getExpiredItems(this.currentLocation?.uuid, this.page, this.pageSize)
        .pipe(
          map((response) => {
            this.pager = response?.pager;
            return response?.results;
          })
        );
    } else if (this.status === "NEARLYSTOCKEDOUT") {
      this.stocksList$ = this.stockService
        .getNearlyStockedOutItems(
          this.currentLocation?.uuid,
          this.page,
          this.pageSize
        )
        .pipe(
          map((response) => {
            this.pager = response?.pager;
            return response?.results;
          })
        );
    } else if (this.status === "NEARLYEXPIRED") {
      this.stocksList$ = this.stockService
        .getNearlyExpiredItems(
          this.currentLocation?.uuid,
          this.page,
          this.pageSize
        )
        .pipe(
          map((response) => {
            this.pager = response?.pager;
            return response?.results;
          })
        );
    }
  }

  onToggleCurrentStock(event: Event, stock: StockObject): void {
    if (event) {
      event.stopPropagation();
      this.currentItemStock$ = this.stockService.getAvailableStockOfAnItem(
        stock?.id,
        this.currentLocation?.uuid
      );
    } else {
      this.currentItemStock$ = of(null);
      this.getStock();
    }
  }
  onSaveLedger(ledgerInput: LedgerInput, currentStock: any): void {
    this.saving = true;
    this.stockService.saveStockLedger(ledgerInput).subscribe((response) => {
      if (!response?.error) {
        this.saving = false;
        this.currentItemStock$ = this.stockService.getAvailableStockOfAnItem(
          currentStock?.id,
          this.currentLocation?.uuid
        );
      }
      if (response?.error) {
        this.errors = [...this.errors, response?.error];
      }
    });
  }
  onViewStockStatus(event: Event, itemID): void {
    if (event) {
      event.stopPropagation();
      this.itemID = itemID;
    }
  }
  onClearItemID() {
    this.itemID = undefined;
  }

  onHideReceivingForm(e: any) {
    e.stopPropagation();
    this.showReceivingForm = false;
  }

  onShowReceivingForm(e: any) {
    e.stopPropagation();
    this.showReceivingForm = true;
  }

  onPageChange(event) {
    // this.page =
    //   event.pageIndex - this.page >= 0 ? this.page + 1 : this.page - 1;
    this.page = this.page + (event?.pageIndex - event?.previousPageIndex);
    this.pageSize = Number(event?.pageSize);
    this.getStock();
  }

  onOpenConsumeModal(
    currentItemStock: any,
    consumeLedgerUuid: string,
    ledgerTypes: any[]
  ): void {
    this.dialog
      .open(ConsumeStockItemModalComponent, {
        maxWidth: "40%",
        data: {
          currentItemStock,
          ledger: (ledgerTypes?.filter(
            (ledger) =>
              (ledger?.id ? ledger?.id : ledger?.uuid) === consumeLedgerUuid
          ) || [])[0],
        },
      })
      .afterClosed()
      .subscribe((shouldReload: boolean) => {
        if (shouldReload) {
          this.getStock();
        }
      });
  }
}
