import { Component, Input, OnInit } from "@angular/core";
import { OpenmrsHttpClientService } from "../../modules/openmrs-http-client/services/openmrs-http-client.service";
import { Observable } from "rxjs";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { FormValue } from "../../modules/form/models/form-value.model";

@Component({
  selector: "app-shared-remote-patient-history",
  templateUrl: "./shared-remote-patient-history.component.html",
  styleUrl: "./shared-remote-patient-history.component.scss",
})
export class SharedRemotePatientHistoryComponent implements OnInit {
  @Input() patient: any;
  @Input() activeVisit: any;
  selectedIdentifier: string;
  remotePatientHistory$: Observable<any>;
  identifierFormField: any;
  constructor(private httpClientService: OpenmrsHttpClientService) {}

  ngOnInit(): void {
    this.selectedIdentifier = this.getPreferredIdentifier(
      this.patient?.identifiers
    );
    this.identifierFormField = new Dropdown({
      id: "identifierType",
      key: "identifierType",
      label: "Identifier Types",
      options: this.patient?.identifiers?.map((identifier: any) => {
        return {
          id: identifier?.identifierType?.display,
          key: identifier?.identifierType?.display,
          label: identifier?.identifierType?.display,
          value: identifier?.identifier,
        };
      }),
    });
    this.getRemoteHistory();
  }

  getRemoteHistory(): void {
    this.remotePatientHistory$ = this.httpClientService.get(
      `icare/sharedrecords?id=` + this.selectedIdentifier
    );
  }

  onFormUpdate(formValue: FormValue): void {
    const values = formValue.getValues();
    const identifierType = values?.identifierType?.value;
    if (identifierType) {
      this.selectedIdentifier = this.getIdentifierByIdentifierType(
        identifierType,
        this.patient?.identifiers
      );
      this.getRemoteHistory();
    }
  }

  getIdentifierByIdentifierType(
    identifierType: string,
    identifiers: any[]
  ): string {
    return (identifiers?.filter(
      (identifier: any) =>
        identifier?.identifierType?.display === identifierType
    ) || [])[0]?.identifier;
  }

  getPreferredIdentifier(identifiers: any[]): string {
    return (identifiers?.filter((identifier: any) => identifier?.preferred) ||
      [])[0]?.identifier;
  }
}
