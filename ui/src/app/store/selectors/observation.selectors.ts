import { createSelector } from "@ngrx/store";
import { ObservationObject } from "src/app/shared/resources/observation/models/obsevation-object.model";
import { AppState, getRootState } from "../reducers";
import { observationAdapter, ObservationState } from "../states";
import { sortBy, reverse, head } from "lodash";
import { getFormEntitiesByNames, getFormsEntities } from "./form.selectors";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { flatten } from "lodash";

const getObservationState = createSelector(
  getRootState,
  (state: AppState) => state.observation
);

export const {
  selectEntities: getObservationEntities,
  selectAll: getAllObservations,
} = observationAdapter.getSelectors(getObservationState);

export const getObservationsByType = (type: string) =>
  createSelector(getAllObservations, (observations: ObservationObject[]) =>
    (observations || []).filter(
      (observation) => observation?.observationType?.display === type
    )
  );

export const getGroupedObservationByConcept = createSelector(
  getAllObservations,
  (observations: ObservationObject[]) => {
    const groupedObservations = {};

    (observations || []).forEach((observation) => {
      if (observation?.concept?.uuid) {
        const conceptObservation =
          groupedObservations[observation.concept.uuid];

        const conceptObservations = reverse(
          sortBy(
            [...(conceptObservation?.history || []), observation],
            "observationDatetime"
          )
        );

        groupedObservations[observation.concept.uuid] = {
          uuid: observation.concept.uuid,
          latest: head(conceptObservations),
          history: conceptObservations,
        };
      }
    });

    return groupedObservations;
  }
);

export const getCountOfVitalsFilled = createSelector(
  getGroupedObservationByConcept,
  getFormsEntities,
  (groupedObservations: any, formEntities: any) => {
    const vitalForm = formEntities
      ? formEntities[ICARE_CONFIG.consultation.vitalFormUuid]
      : null;

    if (!vitalForm) {
      return 0;
    }

    let vitalsCount = 0;
    (vitalForm?.formFields || []).map((formField: any) => {
      const observation = groupedObservations[formField?.concept?.uuid];
      vitalsCount += observation?.latest?.value ? 1 : 0;
      getSetMembers(formField?.setMembers, groupedObservations);
    });
    return vitalsCount;
  }
);

export const getVitalSignObservations = createSelector(
  getGroupedObservationByConcept,
  getFormsEntities,
  (groupedObservations: any, formEntities: any) => {
    const vitalForm = formEntities
      ? formEntities[ICARE_CONFIG.consultation.vitalFormUuid]
      : null;

    if (!vitalForm) {
      return [];
    }
    const vitalsArray = (vitalForm?.formFields || []).map((formField: any) => {
      const observation = groupedObservations[formField?.concept?.uuid];
      // console.log('formfield', formField);
      return {
        id: formField?.concept?.uuid,
        display: formField?.concept?.display,
        value: observation?.latest?.value,
        units: formField?.formField?.units,
        min: formField?.formField?.min,
        max: formField?.formField?.max,
        children: !formField?.formFields
          ? []
          : getSetMembers(formField?.setMembers, groupedObservations),
      };
    });
    //group items
    // console.log("vitalsArray", vitalsArray);
    // console.log("groupedObservations", groupedObservations);
    return {
      noChildren: vitalsArray?.filter(
        (vitailItem) => vitailItem?.children?.length === 0
      ),
      withChildren: vitalsArray?.filter(
        (vitailItem) => vitailItem?.children?.length > 0
      ),
    };
  }
);

function getSetMembers(setMembers, groupedObservations) {
  // console.log('formFields', formFields);
  // console.log('groupedObservations', groupedObservations);
  return setMembers.map((setMember: any) => {
    const observation = groupedObservations[setMember?.concept?.uuid];
    // console.log('formField', setMember);
    return {
      ...setMember,
      display: setMember?.concept?.display,
      value: observation ? observation?.latest?.value : null,
      valueObject:
        observation && observation?.latest?.valueObject
          ? observation?.latest?.valueObject
          : null,
      ...setMember?.formField,
      children: setMember?.formFields
        ? getSetMembers(
            getSetMembersFromFormFields(setMember.formFields),
            groupedObservations
          )
        : [],
    };
  });
}

function getSetMembersFromFormFields(formFields) {
  return flatten(
    formFields.map((formField) => {
      return formField?.formFields;
    })
  );
}

export const getSavingObservationStatus = createSelector(
  getObservationState,
  (state: ObservationState) => state.savingObservations
);
