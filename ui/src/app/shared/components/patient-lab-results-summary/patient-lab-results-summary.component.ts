import { Component, Input, OnInit } from '@angular/core';
import { filter, each, keyBy, uniqBy } from 'lodash';
import { Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OpenmrsHttpClientService } from '../../modules/openmrs-http-client/services/openmrs-http-client.service';
import { Visit } from '../../resources/visits/models/visit.model';

@Component({
  selector: 'app-patient-lab-results-summary',
  templateUrl: './patient-lab-results-summary.component.html',
  styleUrls: ['./patient-lab-results-summary.component.scss'],
})
export class PatientLabResultsSummaryComponent implements OnInit {
  @Input() labConceptsTree: any;
  @Input() observations: any;
  @Input() patientVisit: Visit;
  labOrdersResultsInformation: any[] = [];
  codedResultsData$: Observable<any>;
  keyedResults: any = {};
  testSetMembersDetails$: Observable<any>;
  constructor(private openMRSHttpClient: OpenmrsHttpClientService) {}

  filteredLabTestsResults: Array<any>;
  labResultsObject: any = [];

  ngOnInit(): void {
    if (!this.patientVisit) {
      const labDeptConceptArray = filter(
        this.labConceptsTree?.setMembers,
        (setMember) => {
          return setMember?.name === 'Lab departments' ? true : false;
        }
      );

      each(
        labDeptConceptArray?.length > 0
          ? labDeptConceptArray[0]?.setMembers
          : [],
        (departmentConcept) => {
          each(departmentConcept?.setMembers, (testConcept) => {
            let test: any = {};
            if (testConcept?.setMembers?.length > 0) {
              test['name'] = testConcept?.name;
              test['value'] = null;
              test['parameters'] = [];
              test['concept'] = testConcept;

              each(testConcept?.setMembers, (parameter) => {
                test?.parameters?.push({
                  concept: parameter,
                  name: parameter?.name,
                  value: this.observations[parameter?.uuid]
                    ? this.observations[parameter?.uuid]?.latest
                    : null,
                });
              });

              this.labResultsObject.push(test);
            } else {
              test['name'] = testConcept?.name;
              test['value'] = this.observations[testConcept?.uuid]
                ? this.observations[testConcept?.uuid]?.latest
                : null;
              test['parameters'] = null;
              test['concept'] = testConcept;

              this.labResultsObject.push(test);
            }
          });
        }
      );

      this.filteredLabTestsResults = filter(this.labResultsObject, (res) => {
        return res?.value || res?.parameters ? true : false;
      });
    } else {
      let obsValuesConcepts = [];
      let testsConcepts = [];
      this.labOrdersResultsInformation = this.patientVisit.labOrders
        ? this.patientVisit.labOrders.map((labOrder: any) => {
            testsConcepts = uniqBy(
              [...testsConcepts, labOrder?.order?.concept],
              'uuid'
            );
            // TODO: For multiple orders for the same test consider using encounter and dates
            const observation: any =
              this.observations[labOrder?.order?.concept?.uuid] &&
              this.observations[labOrder?.order?.concept?.uuid]?.latest
                ? this.observations[labOrder?.order?.concept?.uuid]?.latest
                : null;
            if (observation) {
              obsValuesConcepts = [
                ...obsValuesConcepts,
                {
                  value: observation?.value,
                  concept: observation?.concept?.uuid,
                },
              ];
            }
            return {
              ...labOrder,
              result: observation,
            };
          })
        : null;

      this.testSetMembersDetails$ =
        this.getSetMembersForTheConcepts(testsConcepts);
      this.codedResultsData$ =
        obsValuesConcepts?.length > 0
          ? this.getValuesForCocedConcepts(obsValuesConcepts)
          : of([]);

      this.codedResultsData$.subscribe((data) => {
        if (data) {
          this.keyedResults = keyBy(data, 'test');
        }
      });
    }
  }

  getSetMembersForTheConcepts(concepts) {
    return zip(
      ...concepts.map((concept) =>
        this.openMRSHttpClient
          .get(
            `concept/${concept?.uuid}?v=custom:(uuid,display,setMembers:(uuid,display))`
          )
          .pipe(
            map((response) => {
              return {
                ...concept,
                members: response?.setMembers,
              };
            }),
            catchError((error) => of(error))
          )
      )
    );
  }

  getValuesForCocedConcepts(obsInfo): Observable<any> {
    return zip(
      ...obsInfo.map((obsInfoData) =>
        this.openMRSHttpClient
          .get(
            `concept/${obsInfoData?.value}?v=custom:(uuid,display,names:(display,conceptNameType))`
          )
          .pipe(
            map((response) => {
              const shortNameDetails = (response.names.filter(
                (name) => name.conceptNameType === 'SHORT'
              ) || [])[0];
              const fullSpecifiedNameDetails = (response.names.filter(
                (name) => name.conceptNameType === 'FULLY_SPECIFIED'
              ) || [])[0];
              return {
                coded: true,
                ...(shortNameDetails
                  ? shortNameDetails
                  : fullSpecifiedNameDetails),
                ...obsInfoData,
                test: obsInfoData?.concept,
              };
            }),
            catchError((error) =>
              of({
                coded: false,
                test: obsInfoData?.concept,
                display: obsInfoData?.value,
              })
            )
          )
      )
    );
  }
}
