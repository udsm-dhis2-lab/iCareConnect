import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { BaseState, initialBaseState } from './base.state';
import { NHIFVisitTypeI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

export interface NHIFVisitTypeState extends EntityState<NHIFVisitTypeI>, BaseState {}

export const NHIFVisitTypeAdapter: EntityAdapter<NHIFVisitTypeI> = createEntityAdapter<
  NHIFVisitTypeI
>({
  selectId: (entity) => entity.VisitTypeID, // Use visit type id as the unique identifier
});

export const initialNHIFVisitTypeState: NHIFVisitTypeState = NHIFVisitTypeAdapter.getInitialState(
  {
    ...initialBaseState,
  }
);
