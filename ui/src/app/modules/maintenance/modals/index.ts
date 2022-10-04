import { AddUserComponent } from "../pages/user-management/add-user/add-user.component";
import { AddNewGenericDrugModalComponent } from "./add-new-generic-drug-modal/add-new-generic-drug-modal.component";
import { DrugListModalComponent } from "./drug-list-modal/drug-list-modal.component";
import { ManageItemPriceComponent } from "./manage-item-price/manage-item-price.component";
import { ManageSystemSettingComponent } from "./manage-system-setting/manage-system-setting.component";

export const maintenanceModals: any[] = [
  ManageItemPriceComponent,
  ManageSystemSettingComponent,
  AddNewGenericDrugModalComponent,
  DrugListModalComponent,
];
export { ManageItemPriceComponent, AddUserComponent };
