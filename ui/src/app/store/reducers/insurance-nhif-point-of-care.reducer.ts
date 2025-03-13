import { createReducer, on, Action } from '@ngrx/store';
import { loadPointOfCare, loadPointOfCareFailure, loadPointOfCareSuccess } from '../actions/insurance-nhif-point-of-care.actions';
import { initialNHIFPointOfCareState, NHIFPointOfCareState, NHIFPointOfCareAdapter } from '../states/insurance-nhif-point-of-care.states';
import { errorBaseState, loadingBaseState, loadedBaseState } from '../states/base.state';

const reducer = createReducer(
  initialNHIFPointOfCareState,
  
  // Handle loading state
  on(loadPointOfCare, (state) => ({ 
    ...state, 
    ...loadingBaseState 
  })),

  // Handle success
  on(loadPointOfCareSuccess, (state, { data }) =>
    NHIFPointOfCareAdapter.setAll(data, { 
      ...state, 
      ...loadedBaseState 
    })
  ),

  // Handle failure
  on(loadPointOfCareFailure, (state, { error }) => ({ 
    ...state, 
    error, 
    ...errorBaseState 
  }))
);

export function NHIFPointOfCareReducer(
  state: NHIFPointOfCareState | undefined,
  action: Action
): NHIFPointOfCareState {
  return reducer(state, action);
}
