import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { flatten, keyBy, mapValues, orderBy, uniq } from "lodash";
import { Observable, of, zip } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { SystemUsersService } from "src/app/core/services/system-users.service";
import { isUserMappedConcept } from "../../modules/form/helpers/is-user-mapped-concept.helper";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";
import { VisitsService } from "../../resources/visits/services/visits.service";
import { SamplesService } from "../../services/samples.service";
import { SampleReferralService } from "src/app/modules/laboratory/modules/sample-referral/services/referral-samples.service";

@Component({
  selector: "app-shared-sample-details",
  templateUrl: "./shared-sample-details.component.html",
  styleUrls: ["./shared-sample-details.component.scss"],
})
export class SharedSampleDetailsComponent implements OnInit {
  @Input() sample: any;
  isClinical: boolean;
  encounterInformation$: Observable<any>;
  sampleConditions$: Observable<any>;
  sampleConditionsKeys: any[];
  @Output() visitDetails: EventEmitter<any> = new EventEmitter<any>();
  @Input() hasResults: boolean;
  @Input() departments: any[];
  @Input() specimenSources: any[];
  @Input() codedReasonsForRejection: any[];
  @Input() viewForReferral: boolean = false;

  sampleDetails$: Observable<any>;
  externalSystems$: Observable<any[]>;
  diagnoses$: Observable<any>;
  constructor(
    private visitService: VisitsService,
    private conceptService: ConceptsService,
    private sampleService: SamplesService,
    private sampleReferralService: SampleReferralService,
    private systemSettingsService: SystemSettingsService,
    private systemUsersService: SystemUsersService
  ) {}

  referralOrderConcept = this.sampleReferralService.referralSettings()?.referralOrderConcept;
  referralEncounterType = this.sampleReferralService.referralSettings()?.referralEncounterType;
  referralForms = this.sampleReferralService.referralSettings()?.forms;

  get sampleStatusesByCategory() {
    return keyBy(this.sample.statuses, "category");
  }

  ngOnInit(): void {
    this.hasResults = false;
    this.sampleDetails$ = this.sampleService.getFormattedSampleByUuid(
      this.sample?.uuid,
      this.departments,
      this.specimenSources,
      this.codedReasonsForRejection
    );
    const encounters$ = this.visitService
      .getVisitEncounterDetailsByVisitUuid({
        uuid: this.sample?.visit?.uuid,
        query: {
          v: "custom:(uuid,visitType,startDatetime,encounters:(uuid,encounterDatetime,encounterType,form:(uuid,display,formFields:(uuid,fieldNumber,fieldPart,field:(uuid,display,concept:(uuid,display,datatype,mappings:(uuid,conceptReferenceTerm:(uuid,code,conceptSource:(uuid))),setMembers:(uuid,display,datatype,mappings:(uuid,conceptReferenceTerm:(uuid,code,conceptSource:(uuid)))))))),location,obs,orders,diagnoses,encounterProviders),stopDatetime,attributes:(uuid,display),location:(uuid,display,tags,parentLocation:(uuid,display)),patient:(uuid,display,identifiers,person,voided)",
        },
      })
      .pipe(
        map((encounters) => {
          encounters =  this.viewForReferral ? encounters?.filter((encounter) => encounter?.encounterType?.uuid === this.referralEncounterType) : encounters;
          return encounters?.map((encounter) => {
            return {
              ...encounter,
              form: {
                ...encounter?.form,
                formFields: orderBy(
                  encounter?.form?.formFields?.filter(
                    (formField) => formField?.fieldNumber
                  ),
                  ["fieldNumber"],
                  ["asc"]
                )?.map((formField: any) => {
                  return {
                    ...formField,
                    field: {
                      ...formField?.field,
                      display: formField?.field?.display?.replace(
                        "SPECIMEN_SOURCE:",
                        ""
                      ),
                    },
                  };
                }),
              },
            };
          });
        })
      );
    this.encounterInformation$ = zip(
      encounters$,
      this.systemSettingsService
        .getSystemSettingsByKey(
          `icare.forms.formFieldsConcepts.dataTypeExtensionReference.conceptSourceUuid`
        )
        .pipe(catchError(() => of(null)))
    ).pipe(
      switchMap(([encounters, conceptSourceUuid]) =>
        this.getEncountersWithUserNames(encounters, conceptSourceUuid)
      )
    );
    this.diagnoses$ = this.visitService
      .getVisitDiagnosesByVisitUuid({
        uuid: this.sample?.visit?.uuid,
        query: {
          v: "custom:(uuid,startDatetime,encounters:(uuid,encounterDatetime,encounterType,location,diagnoses,encounterProviders),stopDatetime,attributes:(uuid,display),location:(uuid,display,tags,parentLocation:(uuid,display)),patient:(uuid,display,identifiers,person,voided)",
        },
      })
      .pipe(
        map((visitDetails) => {
          return visitDetails;
        })
      );
    this.sampleConditions$ = zip(
      this.conceptService.getConceptDetailsByUuid(
        this.sampleStatusesByCategory["CONDITION"]?.remarks
      ),
      this.conceptService.getConceptDetailsByUuid(
        this.sampleStatusesByCategory["TRANSPORT_CONDITION"]?.remarks
      ),
      this.conceptService.getConceptDetailsByUuid(
        this.sampleStatusesByCategory["TRANSPORT_TEMPERATURE"]?.remarks
      ),
      this.conceptService.getConceptDetailsByUuid(
        this.sampleStatusesByCategory["PRIORITY"]?.remarks
      )
    ).pipe(
      map((response) => {
        return {
          CONDITION: response[0]?.display,
          TRANSPORT_CONDITION: response[1]?.display,
          TRANSPORT_TEMPERATURE: response[2]?.display,
          PRIORITY: response[3]?.display,
        };
      })
    );
    this.sampleConditionsKeys = Object.keys(this.sampleStatusesByCategory);
    this.isClinical =
      (
        this.sample?.statuses?.filter(
          (status) => status?.status === "CLINICAL"
        ) || []
      )?.length > 0;
    this.visitService
      .getVisitDetailsByVisitUuid(this.sample?.visit?.uuid, {
        v: "custom:(uuid,visitType,startDatetime,attributes:(uuid,display,value,attributeType:(uuid,display))",
      })
      ?.subscribe((response) => {
        if (response) {
          this.visitDetails.emit(response);
        }
      });
  }

  private getEncountersWithUserNames(
    encounters: any[],
    conceptSourceUuid: string
  ): Observable<any[]> {
    if (!Array.isArray(encounters) || !conceptSourceUuid) {
      return of(encounters);
    }
    const userConceptUuids: string[] = uniq(
      flatten(
        encounters.map((encounter) =>
          flatten(
            (encounter?.form?.formFields || []).map((formField: any) => [
              formField?.field?.concept,
              ...(formField?.field?.concept?.setMembers || []),
            ])
          )
        )
      )
        .filter((concept) => isUserMappedConcept(concept, conceptSourceUuid))
        .map((concept: any) => concept?.uuid)
    );
    const userUuids: string[] = uniq(
      flatten(
        encounters.map((encounter) =>
          userConceptUuids.map(
            (conceptUuid) => encounter?.keyedObs?.[conceptUuid]?.latest?.value
          )
        )
      ).filter((value) => value && typeof value === "string")
    );
    if (userUuids.length === 0) {
      return of(encounters);
    }
    return zip(
      ...userUuids.map((uuid) =>
        this.systemUsersService.getUserById(uuid).pipe(
          map((user: any) => {
            return { uuid, name: user?.person?.display };
          }),
          catchError(() => of({ uuid, name: null }))
        )
      )
    ).pipe(
      map((users) => {
        const usersByUuid = keyBy(users, "uuid");
        return encounters.map((encounter) => {
          return {
            ...encounter,
            keyedObs: mapValues(encounter?.keyedObs, (obs, conceptUuid) => {
              const name =
                userConceptUuids.indexOf(conceptUuid) > -1
                  ? usersByUuid[obs?.latest?.value]?.name
                  : null;
              return name
                ? {
                    ...obs,
                    latest: {
                      ...obs?.latest,
                      value: { uuid: obs?.latest?.value, display: name },
                    },
                  }
                : obs;
            }),
          };
        });
      })
    );
  }
}
