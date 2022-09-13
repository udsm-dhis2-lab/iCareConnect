import * as _ from "lodash";
import { Location } from "../models";

let locationPath = "";

export function formatLocationsPayLoad(locations): Location[] {
  return _.map(locations, (location) => {
    // if (!location.retired) {
    locationPath = "";
    const modules = getLocationModules(location);
    return {
      ...location,
      id: location?.uuid,
      uuid: location?.uuid,
      country: location?.country,
      stateProvince: location?.stateProvince,
      postalCode: location?.postalCode,
      description: location?.description,
      name: location?.display,
      display: location?.display,
      childLocations: location?.childLocations,
      parentLocation: location?.parentLocation,
      links: location?.links,
      attributes: location?.attributes,
      tags: location?.tags,
      areChildLocationsBeds: checkIfTheChildAreBeds(location?.childLocations),
      areChildLocationsCabinets: checkIfTheChildAreCabinets(
        location?.childLocations
      ),
      beds: getBeds(location?.childLocations),
      cabinets: getCabinets(location?.childLocations),
      path: _.reverse(
        (
          location?.uuid +
          "/" +
          (location?.parentLocation &&
          location?.parentLocation.hasOwnProperty("uuid")
            ? getPathForTheLocation(location?.parentLocation)
            : "")
        ).split("/")
      )
        .join("/")
        .substring(1),
      billingConcept:
        location?.attributes.length > 0
          ? (location?.attributes?.filter(
              (attribute) =>
                attribute?.attributeType?.display === "Billing concept"
            ) || [])[0]?.value
          : null,
      modules: modules,
    };
    // }
  }).filter((loc) => loc);
}

function getLocationModules(location) {
  const locationModuleAttributes =
    location?.attributes?.filter(
      (attribute) =>
        !attribute?.voided &&
        attribute?.attributeType?.display.toLowerCase() === "modules" &&
        !attribute?.voided
    ) || [];
  return locationModuleAttributes?.length > 0
    ? locationModuleAttributes.map((attribute) => {
        return {
          uuid: attribute?.uuid,
          id: attribute?.value.toLowerCase(),
          location,
        };
      })
    : [];
}

function checkIfTheChildAreBeds(childLocations) {
  /**
   * TODO: this has to be softcodes using global configs
   */
  return childLocations && childLocations?.length > 0
    ? childLocations[0]?.tags?.some((tag) => tag?.display === "Bed Location")
    : false;
}

function checkIfTheChildAreCabinets(childLocations) {
  /**
   * TODO: this has to be softcodes using global configs
   */
  return childLocations && childLocations?.length > 0
    ? childLocations[0]?.tags?.some(
        (tag) => tag?.display === "Mortuary Location"
      )
    : false;
}

function getBeds(childLocations) {
  return checkIfTheChildAreBeds(childLocations) ? childLocations : [];
}

function getCabinets(childLocations) {
  return checkIfTheChildAreCabinets(childLocations) ? childLocations : [];
}

function getPathForTheLocation(location) {
  locationPath +=
    location?.uuid +
    "/" +
    (location?.parentLocation && location?.parentLocation.hasOwnProperty("uuid")
      ? getPathForTheLocation(location?.parentLocation)
      : "");
  return locationPath;
}

export function getChildrenLocations(location) {
  return location?.childLocations;
}
