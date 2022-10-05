import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { DrugsService } from "src/app/shared/resources/drugs/services/drugs.service";
import { ManageDrugModalComponent } from "../../modals/manage-drug-modal/manage-drug-modal.component";

@Component({
  selector: "app-drugs-list",
  templateUrl: "./drugs-list.component.html",
  styleUrls: ["./drugs-list.component.scss"],
})
export class DrugsListComponent implements OnInit {
  @Input() conceptUuid: string;
  drugs$: Observable<any>;
  startIndex: number = 0;
  limit: number = 10;

  page: number = 1;
  searchingText: string;
  constructor(private drugService: DrugsService, private dialog: MatDialog) {}

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
        v: "custom:(uuid,display,strength,concept:(uuid,display))",
      });
    }
  }

  onGetList(event: Event, actionType: string): void {
    event.stopPropagation();
    this.page = actionType === "next" ? this.page + 1 : this.page - 1;
    this.startIndex = this.limit * this.page - 1 + 1;
    this.getDrugs();
  }

  onSearch(event): void {
    this.getDrugs();
  }

  onEdit(event: Event, drug): void {
    this.dialog
      .open(ManageDrugModalComponent, {
        width: "40%",
        data: {
          ...drug,
        },
      })
      .afterClosed()
      .subscribe((shouldReloadData) => {
        if (shouldReloadData) {
          this.getDrugs();
        }
      });
  }

  onAddNew(event: Event): void {
    event.stopPropagation();
    this.dialog
      .open(ManageDrugModalComponent, {
        width: "40%",
      })
      .afterClosed()
      .subscribe((shouldReloadData) => {
        if (shouldReloadData) {
          this.getDrugs();
        }
      });
  }
}
