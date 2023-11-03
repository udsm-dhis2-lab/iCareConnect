import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { PatientService } from "../../resources/patient/services/patients.service";
import { PersonattributetypeGetFull } from "../../resources/openmrs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-shared-next-of-kins-form",
  templateUrl: "./shared-next-of-kins-form.component.html",
  styleUrls: ["./shared-next-of-kins-form.component.scss"],
})
export class SharedNextOfKinsFormComponent implements OnInit {
  @Input() patient: any;
  personAttributeTypes$: Observable<PersonattributetypeGetFull[]>;
  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.personAttributeTypes$ = this.patientService
      .getPersonAttributeTypes()
      .pipe(
        map((response: any[]) => {
          return response?.filter(
            (attributeType: PersonattributetypeGetFull) =>
              attributeType?.display?.toLowerCase()?.indexOf("kin") === 0
          );
        })
      );
  }
}
