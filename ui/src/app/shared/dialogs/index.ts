import { DispensingFormComponent } from "./dispension-form/dispension-form.component";
import { GeneralDispensingFormComponent } from "./general-dispension-form/general-dispension-form.component";
import { PatientListDialogComponent } from "./patient-list-dialog/patient-list-dialog.component";
import { ShortMessageConstructionComponent } from "./short-message-construction/short-message-construction.component";

export const sharedDialogs: any[] = [
  PatientListDialogComponent,
  DispensingFormComponent,
  ShortMessageConstructionComponent,
  GeneralDispensingFormComponent
];
export {
  PatientListDialogComponent,
  DispensingFormComponent,
  ShortMessageConstructionComponent,
};
