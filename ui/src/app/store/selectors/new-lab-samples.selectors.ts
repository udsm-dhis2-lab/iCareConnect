import { createSelector } from "@ngrx/store";
import { getRootState, AppState } from "../reducers";
import { newLabSamplesAdapter, NewLabSamplesState } from "../states";

import * as _ from "lodash";
import { getLISConfigurations } from "./lis-configurations.selectors";

const getSamplesState = createSelector(
  getRootState,
  (state: AppState) => state.samples
);

export const getFormattedLabSamplesLoadedState = createSelector(
  getSamplesState,
  (state: NewLabSamplesState) => state.loaded
);

export const {
  selectAll: getAllFormattedLabSamples,
  selectEntities: getAllFormattedLabSampleEntities,
} = newLabSamplesAdapter.getSelectors(getSamplesState);

export const getFormattedLabSamplesForTracking = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    return _.map(
      _.filter(_.orderBy(samples, ["dateCreated"], ["desc"]), (sample) => {
        if (
          sample?.searchingText
            ?.toLowerCase()
            .indexOf(props?.searchingText.toLowerCase()) > -1 &&
          sample?.department?.departmentName
            .toLowerCase()
            .indexOf(props?.department?.toLowerCase()) > -1
        ) {
          return sample;
        }
      }) || [],
      (sample) => {
        return {
          ...sample,
          completed:
            getCompletedOrders(sample?.orders)?.length == sample?.orders?.length
              ? true
              : false,
          atLeastOneHasFirstSignOff:
            getOrdersWithFirstSigOff(sample?.orders)?.length > 0 ? true : false,
          atLeastOneHasResults:
            getOrdersWithResults(sample?.orders)?.length > 0 ? true : false,
          atLestOneOrderWithRejectedResults:
            getOrdersWithRejectedResults(sample?.orders)?.length > 0
              ? true
              : false,
        };
      }
    );
  }
);

export const getAcceptedFormattedLabSamples = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    return (
      _.filter(_.orderBy(samples, ["dateCreated"], ["desc"]), (sample) => {
        if (
          sample?.accepted &&
          !sample?.markedForRecollection &&
          sample?.searchingText
            ?.toLowerCase()
            .indexOf(props?.searchingText.toLowerCase()) > -1 &&
          sample?.department?.departmentName
            .toLowerCase()
            .indexOf(props?.department?.toLowerCase()) > -1
        ) {
          return sample;
        }
      }) || []
    );
  }
);

export const getFormattedLabSamplesToAccept = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    return (
      _.filter(
        _.orderBy(
          _.filter(samples, {
            accepted: false,
            rejected: false,
            markedForRecollection: false,
          }),
          ["priorityOrderNumber", "dateCreated"],
          ["asc", "desc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || []
    );
  }
);

export const getFormattedRejectedLabSamples = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    const rejectedSamples =
      _.filter(
        _.orderBy(
          _.map(
            _.filter(samples, (sample) => {
              if (sample?.rejected || sample?.markedForRecollection) {
                // console.log(sample);
                return sample;
              }
            }),
            (sample) => {
              return {
                ...sample,
                keyForCheckingRecollection:
                  sample?.mrn +
                  "-" +
                  sample?.departmentName +
                  "-" +
                  sample?.specimen?.specimenName,
              };
            }
          ),
          ["priorityOrderNumber", "dateCreated"],
          ["asc", "desc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || [];

    const otherSamples =
      _.filter(
        _.map(samples, (sample) => {
          return {
            ...sample,
            keyForCheckingRecollection:
              sample?.mrn +
              "-" +
              sample?.departmentName +
              "-" +
              sample?.specimen?.name,
          };
        }),
        (sample) => {
          if (!sample?.markedForRecollection && !sample?.rejected) {
            return sample;
          }
        }
      ) || [];
    return rejectedSamples.filter((sample) => {
      if (
        (
          otherSamples.filter(
            (smp) =>
              smp?.keyForCheckingRecollection ===
              sample?.keyForCheckingRecollection
          ) || []
        )?.length === 0
      ) {
        return sample;
      }
    });
  }
);

export const getFormattedLabSamplesToFeedResults = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    const unCompletedSamples = _.map(
      _.filter(samples, (sample) => {
        const completedOrders = getCompletedOrders(sample?.orders);
        if (
          sample?.accepted &&
          !sample?.markedForRecollection &&
          completedOrders?.length !== sample?.orders?.length
        ) {
          return sample;
        }
      }),
      (sample) => {
        return {
          ...sample,
          atLeastOneHasFirstSignOff:
            getOrdersWithFirstSigOff(sample?.orders)?.length > 0 ? true : false,
          atLeastOneHasResults:
            getOrdersWithResults(sample?.orders)?.length > 0 ? true : false,
          atLestOneOrderWithRejectedResults:
            getOrdersWithRejectedResults(sample?.orders)?.length > 0
              ? true
              : false,
        };
      }
    );
    return (
      _.filter(
        _.orderBy(
          unCompletedSamples,
          ["priorityOrderNumber", "dateCreated"],
          ["asc", "desc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || []
    );
  }
);

export const getCompletedLabSamples = createSelector(
  getAllFormattedLabSamples,
  getLISConfigurations,
  (samples, lisConfigs, props) => {
    const completedSamples = _.filter(samples, (sample) => {
      const completedOrders = getCompletedOrders(
        sample?.orders,
        lisConfigs?.isLIS
      );
      if (
        sample?.accepted &&
        completedOrders?.length == sample?.orders?.length
      ) {
        return sample;
      }
    });
    return (
      _.filter(
        _.orderBy(
          completedSamples,
          ["dateCreated", "priorityOrderNumber"],
          ["asc", "asc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || []
    );
  }
);

export const getPatientsWithCompletedLabSamples = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    // console.log('SAMP ', samples);

    const filteredCompletedSamples =
      _.filter(
        _.orderBy(
          _.filter(samples, (sample) => {
            const completedOrders = getCompletedOrders(sample?.orders);
            if (
              sample?.accepted &&
              completedOrders?.length == sample?.orders?.length
            ) {
              return sample;
            }
          }),
          ["dateCreated", "priorityOrderNumber"],
          ["asc", "asc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || [];

    // console.log('filtered completed samples :: ', filteredCompletedSamples);

    const groupedByMRN = _.groupBy(filteredCompletedSamples, "mrn");

    // console.log('grouped by mrn samples :: ', groupedByMRN);

    return _.map(Object.keys(groupedByMRN), (key) => {
      const samplesKeyedByDepartments = _.groupBy(
        groupedByMRN[key],
        "departmentName"
      );
      return {
        mrn: key,
        patient: groupedByMRN[key][0]?.patient,
        departments: _.map(Object.keys(samplesKeyedByDepartments), (dep) => {
          return {
            departmentName: dep,
            samples: samplesKeyedByDepartments[dep],
          };
        }),
      };
    });
  }
);

export const getFormattedLabSampleOrdersBySampleIdentifier = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    const orderedItemsMatched = (_.filter(samples, {
      id: props?.sampleIdentifier,
    }) || [])[0]?.orders;

    // console.log('check hii log : ', orderedItemsMatched);

    return orderedItemsMatched.map((item) => {
      if (item?.order?.concept?.setMembers?.length > 0) {
        let allocations = {};
        _.each(item?.testAllocations, (all) => {
          allocations[all?.concept?.uuid] = all;
        });

        return {
          ...item,
          allocationsPairedBySetMember: allocations, // keyvalue paired by setmember concept id
        };
      } else {
        return item;
      }
    });
  }
);

export const getFormattedLabSampleBySampleIdentifier = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    return (_.filter(samples, { id: props?.sampleIdentifier }) || [])[0];
  }
);

export const getWorkList = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    const acceptedSamples = _.filter(samples, { accepted: true }) || [];
    if (acceptedSamples?.length === 0) {
      return [];
    }
    return (
      _.filter(
        _.orderBy(
          _.filter(acceptedSamples, (sample) => {
            if (sample?.acceptedBy?.user?.uuid == props?.userUuid) {
              return sample;
            }
          }) || [],
          ["dateCreated"],
          ["desc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || []
    );
  }
);

function getCompletedOrders(orders, isLIS?: boolean) {
  return (
    _.filter(orders, (order) => {
      if (
        (!isLIS &&
          order?.testAllocations?.length > 0 &&
          order?.testAllocations[0]?.secondSignOff) ||
        (isLIS && order?.testAllocations[0]?.results?.length > 0)
      ) {
        return order;
      }
    }) || []
  );
}

function getOrdersWithFirstSigOff(orders) {
  return (
    _.filter(orders, (order) => {
      if (
        order?.testAllocations?.length > 0 &&
        order?.testAllocations[0]?.firstSignOff
      ) {
        return order;
      }
    }) || []
  );
}

function getOrdersWithResults(orders) {
  return (
    _.filter(orders, (order) => {
      if (
        order?.testAllocations?.length > 0 &&
        order?.testAllocations[0]?.results?.length > 0
      ) {
        return order;
      }
    }) || []
  );
}

function getOrdersWithRejectedResults(orders) {
  return (
    _.filter(orders, (order) => {
      if (
        order?.testAllocations?.length > 0 &&
        _.orderBy(
          order?.testAllocations[0]?.statuses,
          ["timestamp"],
          ["desc"]
        )[0]?.status == "REJECTED"
      ) {
        return order;
      }
    }) || []
  );
}

export const getPatientWithSampleDetails = createSelector(
  getAllFormattedLabSamples,
  (samples, props) => {
    // console.log("samples there :: ", samples)

    const filteredCompletedSamples =
      _.filter(
        _.orderBy(
          _.filter(samples, (sample) => {
            const completedOrders = getCompletedOrders(sample?.orders);
            if (
              sample?.accepted &&
              completedOrders?.length == sample?.orders?.length
            ) {
              return sample;
            }
          }),
          ["dateCreated", "priorityOrderNumber"],
          ["asc", "asc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(props?.searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(props?.department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || [];

    const filteredCompletedSamplesForPatient = _.filter(
      filteredCompletedSamples,
      (completedSample) => {
        return completedSample?.patient?.uuid == props?.patientUuid
          ? true
          : false;
      }
    );

    const groupedByMRN = _.groupBy(filteredCompletedSamplesForPatient, "mrn");

    let whats = _.map(Object.keys(groupedByMRN), (key) => {
      const samplesKeyedByDepartments = _.groupBy(
        groupedByMRN[key],
        "departmentName"
      );

      return {
        mrn: key,
        patient: groupedByMRN[key][0]?.patient,
        departments: _.map(Object.keys(samplesKeyedByDepartments), (dep) => {
          return {
            departmentName: dep,
            samples: samplesKeyedByDepartments[dep],
          };
        }),
      };
    });

    return whats?.length > 0 ? whats[0] : null;
  }
);
