import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { select, Store } from "@ngrx/store";
import { IssuingObject } from "src/app/shared/resources/store/models/issuing.model";
import { IssuingService } from "src/app/shared/resources/store/services/issuing.service";
import { orderBy, flatten, omit } from "lodash";
import { Observable, zip, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { loadLocationsByTagName } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getParentLocation, getStoreLocations } from "src/app/store/selectors";
import { RequisitionService } from "src/app/shared/resources/store/services/requisition.service";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation/shared-confirmation.component";
import { IssuingFormComponent } from "../../store-modals/issuing-form/issuing-form.component";
import { RequestCancelComponent } from "../../store-modals/request-cancel/request-cancel.component";
import { ConfirmRequisitionsModalComponent } from "../../store-modals/confirm-requisitions-modal/confirm-requisitions-modal.component";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { getFilteredIssueItems } from "../../helpers/issuings.helper";
import { formatDateToString } from "../../helpers/format-date.helper";
import {DrugsService} from "../../resources/drugs/services/drugs.service";
import {ExportDataService} from "../../../core/services/export-data.service";
import {
  ManageDrugModalComponent
} from "../../../modules/maintenance/modals/manage-drug-modal/manage-drug-modal.component";
import {ViewBinModalComponent} from "../../../modules/maintenance/modals/view-bin/view-bin-modal.component";

@Component({
  selector: "app-bin-cards",
  templateUrl: "bin-cards.component.html",
  styleUrls: ["./bin-cards.component.scss"],
})
export class BinCardsComponent implements OnInit {
  @Input() conceptUuid: string;
  drugs$: Observable<any>;
  startIndex: number = 0;
  limit: number = 10;

  page: number = 1;
  searchingText: string;
  downloading: boolean = false;

  bins = [
    {
      name: 'Chlroxine',
      data: [
        {
          target: 'Substore Mabibo',
          issued_date: new Date('1-August-2022'),
          received_date: new Date('31-July-2022'),
          issued_quantity: 10,
          quantity_received: 10,
          balance: 0,
          remarks: 'dispensed'
        },
        {
          target: 'Substore COICT',
          issued_date: new Date('1-August-2022'),
          received_date: new Date('31-July-2022'),
          issued_quantity: 10,
          quantity_received: 7,
          balance: 3,
          remarks: 'dispensed'
        },
        {
          target: 'Expired',
          issued_date: new Date('5-September-2022'),
          received_date: new Date('3-August-2022'),
          issued_quantity: 10,
          quantity_received: 5,
          balance: 5,
          remarks: 'dispensed'
        }
      ]
    },
    {
      name: 'Diclofenac',
      data: [
        {
          target: 'Substore Mabibo',
          issued_date: new Date('1-August-2022'),
          received_date: new Date('31-July-2022'),
          issued_quantity: 10,
          quantity_received: 10,
          balance: 0,
          remarks: 'dispensed'
        },
        {
          target: 'Substore COICT',
          issued_date: new Date('1-August-2022'),
          received_date: new Date('31-July-2022'),
          issued_quantity: 10,
          quantity_received: 7,
          balance: 3,
          remarks: 'dispensed'
        },
        {
          target: 'Expired',
          issued_date: new Date('5-September-2022'),
          received_date: new Date('3-August-2022'),
          issued_quantity: 10,
          quantity_received: 5,
          balance: 5,
          remarks: 'dispensed'
        }
      ]
    },
    {
      name: 'Amoxicilin',
      data: [
        {
          target: 'Substore Mabibo',
          issued_date: new Date('1-August-2022'),
          received_date: new Date('31-July-2022'),
          issued_quantity: 10,
          quantity_received: 10,
          balance: 0,
          remarks: 'dispensed'
        },
        {
          target: 'Substore COICT',
          issued_date: new Date('1-August-2022'),
          received_date: new Date('31-July-2022'),
          issued_quantity: 10,
          quantity_received: 7,
          balance: 3,
          remarks: 'dispensed'
        },
        {
          target: 'Expired',
          issued_date: new Date('5-September-2022'),
          received_date: new Date('3-August-2022'),
          issued_quantity: 10,
          quantity_received: 5,
          balance: 5,
          remarks: 'dispensed'
        }
      ]
    }
  ]

  constructor(
      private drugService: DrugsService,
      private dialog: MatDialog,
      private exportDataService: ExportDataService
  ) {}

  ngOnInit(): void {
    this.getDrugs();
  }

  getDrugs(): void {
    if (this.conceptUuid) {
      this.drugs$ = this.drugService.getDrugsUsingConceptUuid(this.conceptUuid);
    } else {
      this.drugs$ = this.drugService.getAllDrugs({
        startIndex: this.startIndex,
        limit: this.limit,
        q: this.searchingText,
        v: "custom:(uuid,display,description,strength,concept:(uuid,display))",
      });
    }
  }

  onGetList(event: Event, actionType: string): void {
    event.stopPropagation();
    this.page = actionType === "next" ? this.page + 1 : this.page - 1;
    this.startIndex = this.limit * this.page - 1 + 1;
    this.getDrugs();
  }



  onView(event: Event, bin): void {
    this.dialog
        .open(ViewBinModalComponent, {
          minWidth: "50%",
          data: bin,
        })
        .afterClosed()
        .subscribe((shouldReloadData) => {
          if (shouldReloadData) {
            this.getDrugs();
          }
        });
  }
}
