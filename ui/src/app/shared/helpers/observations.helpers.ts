import { sortBy, head, reverse } from "lodash";
import { ObservationObject } from "../resources/observation/models/obsevation-object.model";

export function groupObservationByConcept(observations: ObservationObject[]) {
  const groupedObservations = {};

  (observations || []).forEach((observation) => {
    if (observation?.concept?.uuid) {
      const conceptObservation = groupedObservations[observation.concept.uuid];

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
