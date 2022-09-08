import { createReducer, on } from "@ngrx/store";
import { initialLocationsState, locationsAdapter } from "../states";
import {
  loadLocationsByTagName,
  loadingLocationsFails,
  setCurrentUserCurrentLocation,
  loadLoginLocations,
  loadLocationById,
  addLoadedLocations,
  upsertLocation,
  loadingLocationByTagNameFails,
  clearLocations,
  updateCurrentLocationStatus,
  upsertLocations,
} from "../actions";
import {
  loadingBaseState,
  loadedBaseState,
  errorBaseState,
} from "../states/base.state";

const reducer = createReducer(
  initialLocationsState,
  on(loadLoginLocations, (state) => ({
    ...state,
    ...loadingBaseState,
  })),
  on(addLoadedLocations, (state, { locations }) =>
    locationsAdapter.addMany(locations, {
      ...state,
      ...loadedBaseState,
      loadingByTagName: false,
      loadedByTagName: true,
      errorLoadingByTagName: null,
    })
  ),
  on(loadingLocationsFails, (state, { error }) => ({
    ...state,
    error,
    ...errorBaseState,
  })),
  on(setCurrentUserCurrentLocation, (state, { location }) => ({
    ...state,
    currentUserCurrentLocation: location,
    settingLocation: true,
  })),
  on(loadLocationById, (state) => ({
    ...state,
  })),
  on(upsertLocation, (state, { location }) =>
    locationsAdapter.upsertOne(location, { ...state })
  ),
  on(upsertLocations, (state, { locations }) =>
    locationsAdapter.upsertMany(locations, { ...state })
  ),
  on(loadLocationsByTagName, (state) => ({
    ...state,
    loadingByTagName: true,
    loadedByTagName: false,
    errorLoadingByTagName: null,
  })),
  on(loadingLocationByTagNameFails, (state, { error }) => ({
    ...state,
    loadingByTagName: false,
    loadedByTagName: true,
    errorLoadingByTagName: error,
  })),
  on(clearLocations, (state) =>
    locationsAdapter.removeAll({ ...state, currentUserCurrentLocation: null })
  ),
  on(updateCurrentLocationStatus, (state, { settingLocation }) => ({
    ...state,
    settingLocation,
  }))
);

export function locationsReducer(state, action) {
  return reducer(state, action);
}
