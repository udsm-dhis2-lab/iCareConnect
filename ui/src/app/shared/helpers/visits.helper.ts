import * as _ from "lodash";

export function getEncountersForLabSample(details) {
  let encounters = [];
  _.map(details, (detail) => {
    _.map(detail.encounters, (encounter) => {
      if (encounter.display && encounter.display.indexOf("LAB_SAMPLE") > -1) {
        encounters = [
          ...encounters,
          { patient: detail.patient, ...encounter, visitUuid: detail.uuid },
        ];
      }
    });
  });
  return encounters;
}

// Consultation
export function getEncountersForConsultation(details) {
  let encounters = [];
  _.each(details, (detail) => {
    if (detail.encounters) {
      _.each(detail.encounters, (encounter) => {
        if (
          encounter.display &&
          encounter.display.indexOf("Consultation") > -1
        ) {
          encounters = [
            ...encounters,
            { patient: detail.patient, ...encounter, visitUuid: detail.uuid },
          ];
        }
      });
    }
  });
  return encounters;
}

export function getPatientsEncounteredLab(data) {
  const info = _.map(data, (patient, index) => {
    return {
      id: patient.patient.uuid,
      names: patient.patient.display,
      position: index + 1,
      action: patient,
    };
  });
  return _.uniqBy(info, "id");
}

export function formatVisitsDetails(visits) {
  return _.map(visits, (visit) => {
    return {
      id: visit.uuid,
      ...visit,
    };
  });
}

export function getVisitsByEncounterTypeWhereThereAreOrders(
  visits,
  encounterType
) {
  let filteredVisits = [];
  _.map(visits, (visit) => {
    _.map(visit.encounters, (encounter) => {
      if (
        encounter.display &&
        encounter.display.indexOf(encounterType) > -1 &&
        encounter.orders.length > 0
      ) {
        filteredVisits = [
          ...filteredVisits,
          { ...visit, patientUuid: visit.patient.uuid },
        ];
      }
    });
  });
  return _.uniqBy(filteredVisits, "uuid");
}

export function getPatientsByVisits(visits) {
  let data = [];
  _.map(
    _.orderBy(
      getVisitsByEncounterTypeWhereThereAreOrders(visits, "Consultation"),
      ["visitStartDatetime"],
      ["desc"]
    ),
    (visit, index) => {
      // if (!visit.stopDatetime && !visit.voided) {

      // }

      data = [
        ...data,
        {
          position: data.length + 1,
          ...visit,
          id: visit.id,
          names: visit?.patient.display.split(" - ")[1],
          patientId: visit?.patient.display.split(" - ")[0],
          mrNo: visit?.patient.display.split(" - ")[0],
          status: "",
          orderDate: visit?.startDatetime.substring(0, 10),
          remarks: "",
          searchingText:
            visit?.patient?.display +
            "-" +
            visit?.patient?.person?.age +
            "-" +
            visit?.patient?.person?.gender,
        },
      ];
    }
  );
  return _.orderBy(_.uniqBy(data, "id"), ["startDatetime"], ["asc"]);
}

export function getFormattedEncountersByEncounterTypeFromVisit(
  visit,
  encounterTypeUuid
) {
  return _.orderBy(
    (
      visit?.encounters?.filter(
        (encounter) => encounter?.encounterType?.uuid === encounterTypeUuid
      ) || []
    )?.map((encounter) => {
      return {
        ...encounter,
        obsKeyedByConcept: _.keyBy(
          encounter.obs?.map((observation) => {
            return {
              ...observation,
              conceptKey: observation?.concept?.uuid,
              valueIsObject: observation?.value?.uuid ? true : false,
            };
          }),
          "conceptKey"
        ),
      };
    }),
    ["encounterDatetime"],
    ["asc"]
  );
}

export function getGenericDrugPrescriptionsFromVisit(visit, genericPrescriptionOrderType) {
  return _.flatten(
    visit?.encounters
      ?.map((encounter) => {
        return (
          encounter?.orders.filter(
            (order) => order.orderType?.uuid === genericPrescriptionOrderType
          ) || []
        )?.map((genericDrugOrder) => {
          let formulatedDescription = encounter?.obs
            ?.map((ob) => {
              if (ob?.comment === null) {
                return ob;
              }
            })
            .filter((ob) => ob);
          return {
            ...genericDrugOrder,
            formulatedDescription: formulatedDescription,
            obs: _.keyBy(
              encounter?.obs?.map((observation) => {
                return {
                  ...observation,
                  conceptKey: observation?.concept?.uuid,
                  valueIsObject: observation?.value?.uuid ? true : false,
                };
              }),
              "conceptKey"
            ),
          };
        });
      })
      ?.filter((order) => order)
  );
}
