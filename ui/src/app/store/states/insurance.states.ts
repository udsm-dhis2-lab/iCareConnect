import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { BaseState, initialBaseState } from './base.state';
import { NHIFPointOfCare } from 'src/app/shared/resources/store/models/insurance.model';

export interface NHIFPointOfCareState extends EntityState<NHIFPointOfCare>, BaseState {}

export const NHIFPointOfCareAdapter: EntityAdapter<NHIFPointOfCare> = createEntityAdapter<
  NHIFPointOfCare
>({
  selectId: (entity) => entity.PointOfCareID, // Use PointOfCareID as the unique identifier
});

export const initialNHIFPointOfCareState: NHIFPointOfCareState = NHIFPointOfCareAdapter.getInitialState(
  {
    ...initialBaseState,
  }
);
