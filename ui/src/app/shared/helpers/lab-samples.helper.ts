import * as _ from "lodash";

export function createSearchingText(sample) {
  return (
    sample?.label +
    "-" +
    sample?.patient?.givenName +
    sample?.patient?.middleName +
    sample?.patient?.familyName +
    sample?.patient?.identifiers[0]?.id +
    _.map(sample?.orders, (order) => {
      return order?.order?.concept?.display;
    }).join("-")
  );
}

export function formatUserChangedStatus(statusDetails) {
  if (statusDetails)
    return {
      ...statusDetails,
      user: {
        display: statusDetails?.user?.name?.split(" (")[0],
        name: statusDetails?.user?.name?.split(" (")[0],
        uuid: statusDetails?.user?.uuid,
      },
    };
  return null;
}

export function formatResults(results) {
  // console.log(results);
  return _.orderBy(
    _.map(results, (result) => {
      return {
        value: result?.valueText
          ? result?.valueText
          : result.valueCoded
          ? result?.valueCoded?.uuid
          : result?.valueNumeric?.toString(),
        ...result,
        resultsFedBy: {
          name: result?.creator?.display
            ? result?.creator?.display.split("(")[0]
            : "",
          uuid: result?.creator?.uuid,
        },
      };
    }),
    ["dateCreated"],
    ["asc"]
  );
}

export function getResultsCommentsStatuses(statuses) {
  return _.filter(statuses, (status) => {
    if (status?.status != "APPROVED" && status?.status != "REJECTED") {
      return status;
    }
  });
}
