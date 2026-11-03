export function isUserMappedConcept(
  concept: any,
  conceptSourceUuid: string
): boolean {
  if (!concept || !conceptSourceUuid) {
    return false;
  }
  return (
    (
      concept?.mappings?.filter(
        (mapping: any) =>
          mapping?.conceptReferenceTerm?.conceptSource?.uuid ===
            conceptSourceUuid && mapping?.conceptReferenceTerm?.code == "USER"
      ) || []
    )?.length > 0
  );
}
