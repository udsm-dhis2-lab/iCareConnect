import { createReducer, on, Action } from "@ngrx/store";
import { initialNHIFPractitionerDetailsState, NHIFPractitionerDetailsState } from "../states/insurance-nhif-practitioner.states";
import { clearNHIFPractitionerDetails, setNHIFPractitionerDetails, updateNHIFPractitionerDetails } from "../actions/insurance-nhif-practitioner.actions";

const reducer = createReducer(
  initialNHIFPractitionerDetailsState,

  // Set NHIF practioner details
  on(setNHIFPractitionerDetails, (state, { data }) => ({
    ...state,
    NHIFPractitionerDetails: data
  })),

  // Update NHIF Practitioner details
  on(updateNHIFPractitionerDetails, (state, { updates }) => ({
    ...state,
    NHIFPractitionerDetails: {
      ...state.NHIFPractitionerDetails,
      ...updates
    }
  })),

   // ✅ Reset to initial state
   on(clearNHIFPractitionerDetails, () => initialNHIFPractitionerDetailsState)
);

export function NHIFPractitionerDetailsReducer(
  state: NHIFPractitionerDetailsState | undefined,
  action: Action
): NHIFPractitionerDetailsState {
  return reducer(state, action);
}
