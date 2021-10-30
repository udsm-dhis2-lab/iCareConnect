import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-locations-chips",
  templateUrl: "./locations-chips.component.html",
  styleUrls: ["./locations-chips.component.scss"],
})
export class LocationsChipsComponent implements OnInit {
  @Input() locations;
  @Input() currentVisit;
  @Output() emitLocationSelection = new EventEmitter<any>();
  currentRoom: any;

  searchTerm: string = "";

  constructor() {}

  ngOnInit(): void {
    this.currentRoom = this.currentVisit?.location;

    const visitServiceTypeObject = this.currentVisit?.attributes.filter(
      (visitAttribute) => {
        return (
          visitAttribute?.visitAttributeDetails?.attributeType?.display ==
          "Visit Service"
        );
      }
    );

    const visitTypeConcept =
      visitServiceTypeObject?.length > 0
        ? visitServiceTypeObject[0]?.visitAttributeDetails?.value
        : null;

    this.locations = this.locations?.filter((location) => {
      return (
        location?.billingConcept == visitTypeConcept &&
        location?.uuid !== this.currentVisit?.location?.uuid
      );
    });

    // console.log(this.locations);
    // console.log(this.currentVisit);
  }

  onSelectRoom(event: Event, room): void {
    event.stopPropagation();
    // console.log(room);
    this.currentRoom = room;

    this.emitLocationSelection.emit(this.currentRoom);
  }

  searchRoom(e: Event) {
    e.stopPropagation();
    this.searchTerm = (e.target as HTMLInputElement).value;
  }
}
