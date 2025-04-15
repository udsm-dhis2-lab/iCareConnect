import { BaseState, initialBaseState } from './base.state';
import { NHIFPractitionerDetailsI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

export interface NHIFPractitionerDetailsState extends BaseState {
    NHIFPractitionerDetails: NHIFPractitionerDetailsI | null; 
}

// Initial state
export const initialNHIFPractitionerDetailsState: NHIFPractitionerDetailsState = {
  ...initialBaseState,
  NHIFPractitionerDetails: null, 
};
