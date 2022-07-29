import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ManageSystemSettingComponent } from "../../modals/manage-system-setting/manage-system-setting.component";

@Component({
  selector: "app-system-settings-list",
  templateUrl: "./system-settings-list.component.html",
  styleUrls: ["./system-settings-list.component.scss"],
})
export class SystemSettingsListComponent implements OnInit {
  systemSettings$: Observable<any>;
  page: number = 1;
  pageSize: number = 10;
  @Input() key: string;
  constructor(
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.systemSettings$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(this.key, {
        startIndex: (this.page - 1) * this.pageSize,
        limit: this.pageSize,
      });
  }

  openModal(event: Event, data: any, isNew?: boolean): void {
    event.stopPropagation();
    this.dialog.open(ManageSystemSettingComponent, {
      width: "40%",
      data: {
        ...(isNew ? data : {}),
        isNew: isNew,
      },
    });
  }

  getItems(event: Event, action: string): void {
    event.stopPropagation();
    this.page = action === "next" ? this.page + 1 : this.page - 1;
    this.systemSettings$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(this.key, {
        startIndex: (this.page - 1) * this.pageSize,
        limit: this.pageSize,
      });
  }
}
