import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { BaseState, initialBaseState } from './base.state';
import { NHIFPointOfCareI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

export interface NHIFPointOfCareState extends EntityState<NHIFPointOfCareI>, BaseState {}

export const NHIFPointOfCareAdapter: EntityAdapter<NHIFPointOfCareI> = createEntityAdapter<
  NHIFPointOfCareI
>({
  selectId: (entity) => entity.PointOfCareID, // Use PointOfCareID as the unique identifier
});

export const initialNHIFPointOfCareState: NHIFPointOfCareState = NHIFPointOfCareAdapter.getInitialState(
  {
    ...initialBaseState,
  }
);
