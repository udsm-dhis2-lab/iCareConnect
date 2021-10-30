import { filter } from 'lodash';

export function sanitizeUserLocations(locationsUuids, allLocations) {
  return filter(allLocations, (location) => {
    if (locationsUuids?.indexOf(location?.uuid) > -1) {
      return location;
    }
  });
}
