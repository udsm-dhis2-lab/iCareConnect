import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { LocationService } from "src/app/core/services";
import { LocationGetFull, LocationtagGetFull } from "../../resources/openmrs";
import { ManageLocationModalComponent } from "../manage-location-modal/manage-location-modal.component";

@Component({
  selector: "app-shared-location-settings",
  templateUrl: "./shared-location-settings.component.html",
  styleUrls: ["./shared-location-settings.component.scss"],
})
export class SharedLocationSettingsComponent implements OnInit {
  @Input() locationTag: LocationtagGetFull;
  @Input() locationTags: LocationtagGetFull[];
  locationsByTag$: Observable<LocationGetFull[]>;
  page: number = 1;
  pageSize: number = 10;
  constructor(
    private locationService: LocationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getLocations();
  }

  getLocations(): void {
    this.locationsByTag$ = this.locationService.getLocationsByTagName(
      this.locationTag?.display,
      {
        limit: this.pageSize,
        startIndex: (this.page - 1) * this.pageSize,
      }
    );
  }

  openModal(event: Event, locationTag: any): void {
    event.stopPropagation();
    this.dialog.open(ManageLocationModalComponent, {
      width: "50%",
      data: {
        locationTag,
        locationTags: this.locationTags,
      },
    });
  }

  getItems(event: Event, actionType: string): void {
    event.stopPropagation();
    this.page = actionType === "next" ? this.page + 1 : this.page - 1;
    this.getLocations();
  }
}
