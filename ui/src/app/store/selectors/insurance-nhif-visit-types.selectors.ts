import { createSelector, createFeatureSelector } from "@ngrx/store";
import { NHIFPointOfCareAdapter, NHIFPointOfCareState } from "../states/insurance-nhif-point-of-care.states";
import { AppState, getRootState } from "../reducers";
import { NHIFVisitTypeAdapter, NHIFVisitTypeState } from "../states/insurance-nhif-visit-types.states";


 const getNHIFVisitTypeState = createSelector(
 getRootState,
  (state: AppState) => state.NHIFVisitTypes
);


export const { selectAll: getListOfVisitTypes } = NHIFVisitTypeAdapter.getSelectors(
  getNHIFVisitTypeState
);

export const getVisitTypeLoading = createSelector(
    getNHIFVisitTypeState,
  (state: NHIFVisitTypeState) => state.loaded
);



