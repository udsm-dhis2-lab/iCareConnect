import { groupBy } from "lodash";
import { keyDepartmentsByTestOrder } from "src/app/shared/helpers/sample-types.helper";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";

export function formulateSamplesByDepartments(
  labSections: ConceptGetFull[],
  testOrders: any[]
) {
  const keyedDepartmentsByTestOrders = keyDepartmentsByTestOrder(labSections);
  //   Add departments to test orders
  const testOrdersWithDepartments = testOrders.map((testOrder) => {
    return {
      ...keyedDepartmentsByTestOrders[testOrder?.value],
      ...testOrder,
    };
  });

  return groupBy(testOrdersWithDepartments, "departmentUuid");
}
