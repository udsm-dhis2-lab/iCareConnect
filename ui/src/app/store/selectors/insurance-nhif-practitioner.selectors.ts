import { createSelector } from "@ngrx/store";
import { AppState, getRootState } from "../reducers";
import { NHIFPractitionerDetailsState } from "../states/insurance-nhif-practitioner.states";

const selectNHIFPractitionerDetailstate = createSelector(
  getRootState,
  (state: AppState) => state.NHIFPractitionerDetails
);

export const selectNHIFPractitionerDetails = createSelector(
  selectNHIFPractitionerDetailstate,
  (state: NHIFPractitionerDetailsState) => state.NHIFPractitionerDetails
);
