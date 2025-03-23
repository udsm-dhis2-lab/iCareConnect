import { createReducer, on, Action } from '@ngrx/store';
import { errorBaseState, loadingBaseState, loadedBaseState } from '../states/base.state';
import { loadVisitType, loadVisitTypeSuccess } from '../actions/insurance-nhif-visit-types.actions';
import { loadVisitFail } from '../actions/visit.actions';
import { initialNHIFVisitTypeState, NHIFVisitTypeAdapter, NHIFVisitTypeState } from '../states/insurance-nhif-visit-types.states';

const reducer = createReducer(
  initialNHIFVisitTypeState,
  
  // Handle loading state
  on(loadVisitType, (state) => ({ 
    ...state, 
    ...loadingBaseState 
  })),

  // Handle success
  on(loadVisitTypeSuccess, (state, { data }) =>
    NHIFVisitTypeAdapter.setAll(data, { 
      ...state, 
      ...loadedBaseState 
    })
  ),

  // Handle failure
  on(loadVisitFail, (state, { error }) => ({ 
    ...state, 
    error, 
    ...errorBaseState 
  }))
);

export function NHIFVisitTypeReducer(
  state: NHIFVisitTypeState | undefined,
  action: Action
): NHIFVisitTypeState {
  return reducer(state, action);
}
