import { createSelector, createFeatureSelector } from "@ngrx/store";
import { NHIFPointOfCareAdapter, NHIFPointOfCareState } from "../states/insurance-nhif-point-of-care.states";
import { AppState, getRootState } from "../reducers";


 const getNHIFPointOfCareState = createSelector(
 getRootState,
  (state: AppState) => state.NHIFPointOfCares
);

// export const getListofPointOfCare = createSelector(
//     getNHIFPointOfCareState,
//   (state: NHIFPointOfCareState) => state.data
// );

export const { selectAll: getListofPointOfCare } = NHIFPointOfCareAdapter.getSelectors(
  getNHIFPointOfCareState
);

export const getPointOfCareLoading = createSelector(
    getNHIFPointOfCareState,
  (state: NHIFPointOfCareState) => state.loaded
);



