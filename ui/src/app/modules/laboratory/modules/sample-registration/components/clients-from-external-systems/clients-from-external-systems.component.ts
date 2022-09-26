import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { OtherClientLevelSystemsService } from "src/app/modules/laboratory/resources/services/other-client-level-systems.service";

@Component({
  selector: "app-clients-from-external-systems",
  templateUrl: "./clients-from-external-systems.component.html",
  styleUrls: ["./clients-from-external-systems.component.scss"],
})
export class ClientsFromExternalSystemsComponent implements OnInit {
  systems: any[] = [
    {
      id: "pimacovid",
      name: "PIMA COVID-19",
      searchingCriteria: [
        {
          id: "zxdIGVIuhWU",
          name: "Passport ID",
          referenceKey: "zxdIGVIuhWU",
        },
        {
          id: "t74raEkPShW",
          name: "Booking ID",
          referenceKey: "t74raEkPShW",
        },
      ],
    },
  ];
  selectedSystem: any;
  selectedSearchCriteria: any;
  searchingText: string;
  clientsList$: Observable<any>;
  constructor(
    private otherClientLevelSystemsService: OtherClientLevelSystemsService
  ) {}

  ngOnInit(): void {
    this.selectedSystem = this.systems[0];
  }

  getSelectedSystem(system: any): void {
    this.selectedSystem = system;
  }

  getSearchingText(event: KeyboardEvent): void {
    this.searchingText = (event.target as HTMLInputElement)?.value;
  }

  searchClientsFromExternalSystems(event: Event): void {
    event.stopPropagation();
    console.log(this.selectedSearchCriteria);
    console.log("searchingText ", this.searchingText);
    this.clientsList$ =
      this.otherClientLevelSystemsService.getClientsFromOtherSystems({
        identifier: "2133573",
        identifierReference: this.selectedSearchCriteria?.referenceKey,
      });
    this.clientsList$.subscribe((response) => console.log(response));
  }

  getSelectedSearchCriteria(criteria: any): void {
    this.selectedSearchCriteria = criteria;
  }
}
