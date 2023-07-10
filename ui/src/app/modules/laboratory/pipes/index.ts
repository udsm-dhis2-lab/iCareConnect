import { GroupParametersByHeadersPipe } from "./group-parameters-by-headers.pipe";
import { IdentifyParametersWithoutHeadersPipe } from "./identify-parameters-without-headers.pipe";

export const labPipes: any[] = [
  GroupParametersByHeadersPipe,
  IdentifyParametersWithoutHeadersPipe,
];
