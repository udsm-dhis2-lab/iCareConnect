export function getFilterIssuedItemsInRequisitions(
  requisitionItems: any[],
  issues: any[]
) {
  let issueItems = [];
  issues?.forEach((issue) => {
    issue?.issueItems?.forEach((issueItem) => {
      const issueReceivedStatuses = issueItem?.issueItemStatuses?.filter(
        (status) => status?.status === "RECEIVED"
      )?.length;
      const issueRejectedStatuses = issueItem?.issueItemStatuses?.filter(
        (status) => status?.status === "REJECTED"
      )?.length;
      // console.log(issueReceivedStatuses);
      issueItems = [
        ...issueItems,
        {
          ...issueItem,
          creator: issue?.creator,
          created: issue?.created,
          requisitionItemStatuses: [
            {
              status:
                issueReceivedStatuses > 0
                  ? "RECEIVED"
                  : issueRejectedStatuses > 0
                  ? "REJECTED"
                  : "ISSUED",
            },
          ],
        },
      ];
    });
  });

  const requisitionItemsModified = issues?.length
    ? requisitionItems
        ?.map((requisitionItem) => {
          const issuedItems = issueItems?.filter(
            (issueItem) => issueItem?.item?.uuid === requisitionItem?.item?.uuid
          );
          if (!issuedItems?.length) {
            return requisitionItem;
          }
          return null;
        })
        .filter((item) => item)
    : requisitionItems;

  return [...requisitionItemsModified, ...issueItems];
}
