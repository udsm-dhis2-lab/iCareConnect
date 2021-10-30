import * as _ from 'lodash';

export function getDrugOrdersFromCurrentVisitEncounters(visit) {
  if (!visit) {
    return null;
  }
  let orders = [];
  _.each(visit.encounters, encounter => {
    orders = [
      ...orders,
      ..._.map(_.filter(encounter.orders, { type: 'drugorder' }), order => {
        return {
          orderNumber: order.orderNumber,
          uuid: order.uuid,
          id: order.uuid,
          patientUuid: order.patient.uuid,
          concept: {
            uuid: order.concept.uuid,
            display: order.concept.display
          },
          encounterUuid: order.encounter.uuid,
          orderer: {
            uuid: order.orderer.uuid,
            display: order.orderer.display
          },
          orderReason: order.orderReason,
          orderReasonNonCoded: order.orderReasonNonCoded,
          orderType: order.orderType.display,
          urgency: order.urgency,
          display: order.display,
          instructions: order.instructions,
          drug: order.drug,
          dose: Number(order.dose),
          doseUnits: {
            uuid: order.doseUnits.uuid,
            display: order.doseUnits.display
          },
          frequency: {
            uuid: order.frequency.uuid,
            display: order.frequency.display
          },
          quantity: Number(order.quantity),
          numRefills: order.numRefills,
          dosingInstructions: order.dosingInstructions,
          duration: order.duration,
          durationUnits: order.durationUnits,
          route: {
            uuid: order.route.uuid,
            display: order.route.display
          },
          brandName: order.brandName,
          type: order.type,
          dispenseAsWritten: order.dispenseAsWritten
        };
      })
    ];
  });
  return orders;
}
