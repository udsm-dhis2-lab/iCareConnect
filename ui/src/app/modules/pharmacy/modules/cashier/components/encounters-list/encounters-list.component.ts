import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PharmacyService } from "src/app/modules/pharmacy/services/pharmacy.service";
import { keyBy } from "lodash";

@Component({
  selector: "app-encounters-list",
  templateUrl: "./encounters-list.component.html",
  styleUrls: ["./encounters-list.component.scss"],
})
export class EncountersListComponent implements OnInit {
  @Input() customForm: any;
  encounters$: Observable<any>;
  encounters: any[];
  headersKeys: any[];
  headers: any[] = [
    {
      id: "no",
      name: "No.",
    },
  ];
  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.headers = [...this.headers, ...this.customForm?.formFields];
    this.headersKeys = this.headers?.map((header: any) => header?.id);
    this.encounters$ = this.pharmacyService
      .getEncounters({
        q: "external",
        v: "custom:(uuid,display,obs)",
      })
      .pipe(
        map((response: any) => {
          return {
            ...response,
            results: response?.results?.map((result: any, index: number) => {
              let data = {};
              data["no"] = index + 1;
              // Object.keys();
              this.customForm?.formFields.forEach((field: any) => {
                const observations = result.obs?.map((observation: any) => {
                  return {
                    ...observation,
                    key: observation?.concept?.uuid,
                  };
                });
                data[field?.id] =
                  keyBy(observations, "key")[field?.id] &&
                  keyBy(observations, "key")[field?.id]?.value
                    ? keyBy(observations, "key")[field?.id]?.value
                    : "-";
              });
              return data;
            }),
          };
        })
      );
    this.encounters$.subscribe((encountersData: any) => {
      if (encountersData) {
        this.encounters = encountersData?.results;
      }
    });
  }
}
