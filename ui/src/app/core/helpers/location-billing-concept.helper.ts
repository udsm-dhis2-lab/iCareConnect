export function getBillingConceptFromLocation(location) {
  return location?.attributes && location?.attributes?.length > 0
    ? ((
        location?.attributes.filter(
          (attribute) =>
            attribute?.attributeType?.display?.toLowerCase() ===
            "billing concept"
        ) || []
      )
        .map((filteredAttribute) => filteredAttribute?.value)
        .filter((concept) => concept) || [])[0]
    : null;
}
