import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ManageReportsModalComponent } from "../../dialogs/manage-reports-modal/manage-reports-modal.component";

@Component({
  selector: "app-shared-reports-list",
  templateUrl: "./shared-reports-list.component.html",
  styleUrls: ["./shared-reports-list.component.scss"],
})
export class SharedReportsListComponent implements OnInit {
  @Input() reports: any[];
  @Input() currentUser: any;
  searchingText: string;
  selectedReport: any;
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  onSearchReport(event: KeyboardEvent): void {
    this.searchingText = (event?.target as HTMLInputElement)?.value;
  }

  onViewReport(event: Event, report: any): void {
    event.stopPropagation();
    this.selectedReport = report;
  }

  getBackToReportsList(backToList: boolean): void {
    if (backToList) {
      this.selectedReport = null;
    }
  }

  onAddNew(event: Event): void {
    event.stopPropagation();
    this.dialog.open(ManageReportsModalComponent, {
      minWidth: "60%",
      data: {
        currentUser: this.currentUser,
      },
    });
  }
}
